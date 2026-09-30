package com.nexora.auth.dto;

import jakarta.validation.constraints.Email;
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
public class RegisterRequest {

    // Display name shown across the application; validation keeps it meaningful and bounded.
    @NotBlank(message = "Display name cannot be empty")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    // Public login/identity handle; restricted to predictable characters for consistency.
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9._]+$",
            message = "Username may only contain letters, numbers, dots, and underscores"
    )
    private String username;

    // Used for account verification and email-based authentication/recovery flows.
    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    // Enforces basic password complexity before the request reaches the authentication service.
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "Password must include uppercase, lowercase, and numeric characters"
    )
    private String password;
}