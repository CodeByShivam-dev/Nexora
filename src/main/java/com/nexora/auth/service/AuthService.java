package com.nexora.auth.service;

import com.nexora.auth.dto.*;
import com.nexora.auth.entity.OtpPurpose;
import com.nexora.auth.entity.RefreshToken;
import com.nexora.auth.repository.RefreshTokenRepository;
import com.nexora.common.exception.DuplicateResourceException;
import com.nexora.common.exception.InvalidTokenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.common.exception.ValidationException;
import com.nexora.profile.entity.Profile;
import com.nexora.profile.repository.ProfileRepository;
import com.nexora.security.JwtService;
import com.nexora.security.RateLimiterService;
import com.nexora.user.dto.UserDto;
import com.nexora.user.entity.Role;
import com.nexora.user.entity.User;
import com.nexora.user.entity.UserStatus;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final AuthenticationManager authenticationManager;
    private final RateLimiterService rateLimiterService;

    @Value("${nexora.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${nexora.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedUsername = request.getUsername().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email address already exists");
        }

        if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new DuplicateResourceException("Username '" + normalizedUsername + "' is already taken");
        }

        User user = User.builder()
                .username(normalizedUsername)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.PENDING_VERIFICATION)
                .verified(false)
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

        // Initialize default profile
        Profile profile = Profile.builder()
                .user(user)
                .displayName(request.getName().trim())
                .updatedAt(Instant.now())
                .build();
        profileRepository.save(profile);
        user.setProfile(profile);

        // Generate verification OTP
        otpService.generateAndSaveOtp(user, OtpPurpose.EMAIL_VERIFICATION);

        // Issue tokens
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp) {
        String identifier = request.getIdentifier().trim().toLowerCase();
        rateLimiterService.checkLoginRateLimit(identifier);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Login failure for identifier '{}' from IP '{}'", identifier, clientIp);
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsernameOrEmail(identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new ValidationException("Your account has been suspended. Please contact support.");
        }

        user.setLastSeenAt(Instant.now());
        userRepository.save(user);

        return createAuthResponse(user);
    }

    @Transactional
    public void verifyEmailOtp(OtpVerifyRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getIdentifier().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        otpService.verifyOtp(user, request.getOtp(), OtpPurpose.EMAIL_VERIFICATION);

        user.setVerified(true);
        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        String identifier = request.getIdentifier().trim().toLowerCase();
        userRepository.findByUsernameOrEmail(identifier).ifPresent(user -> {
            otpService.generateAndSaveOtp(user, OtpPurpose.PASSWORD_RESET);
        });
        // Silent success prevents email enumeration
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getIdentifier().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        otpService.verifyOtp(user, request.getOtp(), OtpPurpose.PASSWORD_RESET);

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate all active sessions for security
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(rawRefreshToken)
                .orElseThrow(() -> new InvalidTokenException("Refresh token is invalid"));

        if (token.isRevoked()) {
            // Token reuse detection: possible compromise, revoke all tokens for this user
            refreshTokenRepository.revokeAllUserTokens(token.getUser());
            log.error("Possible token reuse breach for user '{}'", token.getUser().getUsername());
            throw new InvalidTokenException("Refresh token has been revoked due to reuse violation");
        }

        if (token.isExpired()) {
            throw new InvalidTokenException("Refresh token has expired");
        }

        // Rotate token
        token.setRevoked(true);
        token.setRevokedAt(Instant.now());

        String newRefreshToken = UUID.randomUUID().toString();
        token.setReplacedByToken(newRefreshToken);
        refreshTokenRepository.save(token);

        RefreshToken freshToken = RefreshToken.builder()
                .user(token.getUser())
                .tokenHash(newRefreshToken)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .build();
        refreshTokenRepository.save(freshToken);

        String newAccessToken = jwtService.generateAccessToken(token.getUser());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresInMs(accessTokenExpirationMs)
                .user(UserDto.from(token.getUser()))
                .build();
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null) {
            refreshTokenRepository.findByTokenHash(rawRefreshToken).ifPresent(token -> {
                token.setRevoked(true);
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
        }
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(rawRefreshToken)
                .expiresAt(Instant.now().plus(refreshTokenExpirationMs, ChronoUnit.MILLIS))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .tokenType("Bearer")
                .expiresInMs(accessTokenExpirationMs)
                .user(UserDto.from(user))
                .build();
    }
}
