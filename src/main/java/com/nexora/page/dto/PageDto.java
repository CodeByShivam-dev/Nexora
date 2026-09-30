package com.nexora.page.dto;

import com.nexora.page.entity.SocialPage;
import com.nexora.user.dto.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageDto {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String avatarUrl;
    private String coverUrl;
    private UserSummaryDto owner;
    private int followersCount;
    private boolean isFollowed;
    private Instant createdAt;

    public static PageDto from(SocialPage page, boolean isFollowed) {
        return PageDto.builder()
                .id(page.getId())
                .name(page.getName())
                .category(page.getCategory())
                .description(page.getDescription())
                .avatarUrl(page.getAvatarUrl())
                .coverUrl(page.getCoverUrl())
                .owner(UserSummaryDto.from(page.getOwner()))
                .followersCount(page.getFollowersCount())
                .isFollowed(isFollowed)
                .createdAt(page.getCreatedAt())
                .build();
    }
}
