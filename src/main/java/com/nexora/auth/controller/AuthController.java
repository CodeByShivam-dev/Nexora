package com.nexora.auth.controller;

import com.nexora.auth.dto.*;
import com.nexora.auth.service.AuthService;
import com.nexora.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, authentication, OTP verification, and session management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {

        // Delegates account creation and verification-code handling to the authentication service.
        AuthResponse response = authService.register(request);

        // Returns HTTP 201 to clearly indicate that a new account was created.
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        response,
                        "Account registered successfully. A verification code has been dispatched."
                ));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with username/email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        // Captures the client's IP address for the authentication/security flow.
        String clientIp = servletRequest.getRemoteAddr();

        // Authentication and token generation are handled by the service layer.
        AuthResponse response = authService.login(request, clientIp);

        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify one-time passcode for email verification")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {
        // The service validates the OTP and completes the email verification flow.
        authService.verifyEmailOtp(request);

        return ResponseEntity.ok(
                ApiResponse.ok(null, "Verification code confirmed successfully.")
        );
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate and refresh authentication tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        // Uses the refresh token to issue a new authentication token pair.
        AuthResponse response = authService.refreshToken(request.getRefreshToken());

        return ResponseEntity.ok(
                ApiResponse.ok(response, "Token refreshed successfully")
        );
    }

    @PostMapping("/password-reset")
    @Operation(summary = "Request password reset verification code")
    public ResponseEntity<ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        // Starts the password recovery flow without exposing account details.
        authService.requestPasswordReset(request);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        null,
                        "If an account matches that identifier, a verification code has been dispatched."
                )
        );
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Confirm password reset using verification code")
    public ResponseEntity<ApiResponse<Void>> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request
    ) {
        // Validates the reset code and updates the user's password through the service layer.
        authService.confirmPasswordReset(request);

        return ResponseEntity.ok(
                ApiResponse.ok(
                        null,
                        "Password has been successfully reset. You may now log in."
                )
        );
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate active session refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        // The request body is optional so logout remains safe even when no refresh token is supplied.
        if (request != null) {
            authService.logout(request.getRefreshToken());
        }

        return ResponseEntity.ok(
                ApiResponse.ok(null, "Logged out successfully")
        );
    }
}