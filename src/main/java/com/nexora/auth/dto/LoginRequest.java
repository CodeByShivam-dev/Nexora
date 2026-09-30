package com.nexora.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    // Accepts either the user's username or registered email as the login identifier.
    @NotBlank(message = "Username or email is required")
    private String identifier;

    // Required credential used to authenticate the account.
    @NotBlank(message = "Password is required")
    private String password;
}