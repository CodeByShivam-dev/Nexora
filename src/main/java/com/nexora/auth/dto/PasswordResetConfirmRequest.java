package com.nexora.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetConfirmRequest {

    // Identifies the account whose password is being reset.
    @NotBlank(message = "Identifier is required")
    private String identifier;

    // Validates the reset OTP format before the request reaches the service layer.
    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
    private String otp;

    // Enforces the minimum password length and basic complexity requirements at the API boundary.
    @NotBlank(message = "New password cannot be empty")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must include uppercase, lowercase, and numeric characters"
    )
    private String newPassword;
}