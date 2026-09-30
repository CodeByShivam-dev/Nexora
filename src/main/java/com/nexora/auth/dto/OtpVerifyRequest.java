package com.nexora.auth.dto;

import com.nexora.auth.entity.OtpPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerifyRequest {

    // Identifies the account for which the OTP verification is being performed.
    @NotBlank(message = "Username or email is required")
    private String identifier;

    // Restricts OTP input to exactly six numeric digits before it reaches the service layer.
    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
    private String otp;

    // Defines the operation for which this OTP was issued, such as email verification or password reset.
    @NotNull(message = "OTP purpose must be specified")
    private OtpPurpose purpose;
}