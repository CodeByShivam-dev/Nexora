package com.nexora.group.dto;

import com.nexora.group.entity.Group;
import com.nexora.group.entity.GroupPrivacy;
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
public class GroupDto {
    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private String coverUrl;
    private GroupPrivacy privacy;
    private UserSummaryDto owner;
    private int membersCount;
    private boolean isJoined;
    private Instant createdAt;

    public static GroupDto from(Group group, boolean isJoined) {
        return GroupDto.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarUrl(group.getAvatarUrl())
                .coverUrl(group.getCoverUrl())
                .privacy(group.getPrivacy())
                .owner(UserSummaryDto.from(group.getOwner()))
                .membersCount(group.getMembersCount())
                .isJoined(isJoined)
                .createdAt(group.getCreatedAt())
                .build();
    }
}
