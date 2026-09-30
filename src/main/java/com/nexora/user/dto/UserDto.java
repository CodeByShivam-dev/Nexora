package com.nexora.user.dto;

import com.nexora.profile.dto.ProfileDto;
import com.nexora.user.entity.Role;
import com.nexora.user.entity.User;
import com.nexora.user.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private UserStatus status;
    private boolean verified;
    private Role role;
    private Instant createdAt;
    private Instant lastSeenAt;
    private ProfileDto profile;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus())
                .verified(user.isVerified())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .lastSeenAt(user.getLastSeenAt())
                .profile(user.getProfile() != null ? ProfileDto.from(user.getProfile()) : null)
                .build();
    }
}
