package com.nexora.auth.dto;

import com.nexora.user.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    // Contains the short-lived token used to authenticate API requests.
    private String accessToken;

    // Used to obtain a new access token without requiring the user to log in again.
    private String refreshToken;

    // Identifies the authentication scheme expected by the client, typically "Bearer".
    private String tokenType;

    // Tells the client how long the access token remains valid.
    private long expiresInMs;

    // Returns the authenticated user's safe DTO representation instead of the entity itself.
    private UserDto user;
}