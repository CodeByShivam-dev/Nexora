package com.nexora.auth.service;

import com.nexora.auth.entity.OtpPurpose;
import com.nexora.auth.entity.OtpVerification;
import com.nexora.auth.repository.OtpVerificationRepository;
import com.nexora.common.exception.BusinessException;
import com.nexora.common.exception.ValidationException;
import com.nexora.security.RateLimiterService;
import com.nexora.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiterService;

    @Value("${nexora.otp.expiration-minutes:10}")
    private int expirationMinutes;

    @Value("${nexora.otp.dev-mode-echo-console:true}")
    private boolean devModeEcho;

    @Transactional
    public String generateAndSaveOtp(User user, OtpPurpose purpose) {
        // Enforce rate limit (max 3 OTP requests per 10 minutes)
        rateLimiterService.checkOtpRequestRateLimit(user.getEmail());

        // Invalidate any active previous OTPs for this user & purpose
        otpRepository.invalidatePreviousOtps(user, purpose);

        // Generate 6-digit cryptographic random OTP
        int rawNumber = 100000 + RANDOM.nextInt(900000);
        String rawOtp = String.valueOf(rawNumber);

        // Hash OTP before persistence
        String hashedOtp = passwordEncoder.encode(rawOtp);

        OtpVerification verification = OtpVerification.builder()
                .user(user)
                .hashedOtp(hashedOtp)
                .purpose(purpose)
                .expiresAt(Instant.now().plus(expirationMinutes, ChronoUnit.MINUTES))
                .attempts(0)
                .build();

        otpRepository.save(verification);

        if (devModeEcho) {
            log.info("[DEV MODE ONLY] Generated OTP for user '{}' (purpose: {}): {}", user.getUsername(), purpose, rawOtp);
        }

        return rawOtp;
    }

    @Transactional
    public boolean verifyOtp(User user, String rawOtp, OtpPurpose purpose) {
        // Rate limit verification attempts
        rateLimiterService.checkOtpVerifyRateLimit(user.getEmail());

        OtpVerification verification = otpRepository
                .findTopByUserAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(user, purpose)
                .orElseThrow(() -> new ValidationException("No active verification code found. Please request a new one."));

        if (verification.isUsed()) {
            throw new ValidationException("This verification code has already been used");
        }

        if (verification.isExpired()) {
            throw new ValidationException("Verification code has expired. Please request a new one.");
        }

        if (verification.getAttempts() >= 5) {
            throw new BusinessException("Too many invalid attempts. This verification code is locked.");
        }

        // Increment attempt count
        verification.setAttempts(verification.getAttempts() + 1);

        if (!passwordEncoder.matches(rawOtp, verification.getHashedOtp())) {
            otpRepository.save(verification);
            int remaining = 5 - verification.getAttempts();
            throw new ValidationException("Invalid verification code. " + remaining + " attempts remaining.");
        }

        // Mark as used
        verification.setUsedAt(Instant.now());
        otpRepository.save(verification);
        return true;
    }
}
