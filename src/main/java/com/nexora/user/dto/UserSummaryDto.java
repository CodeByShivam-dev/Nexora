package com.nexora.user.dto;

import com.nexora.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private boolean verified;

    public static UserSummaryDto from(User user) {
        String displayName = user.getUsername();
        String avatar = null;
        if (user.getProfile() != null) {
            if (user.getProfile().getDisplayName() != null) {
                displayName = user.getProfile().getDisplayName();
            }
            avatar = user.getProfile().getAvatarUrl();
        }
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(displayName)
                .avatarUrl(avatar)
                .verified(user.isVerified())
                .build();
    }
}
