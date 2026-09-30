package com.nexora.group.dto;

import com.nexora.group.entity.GroupMember;
import com.nexora.group.entity.GroupRole;
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
public class GroupMemberDto {
    private Long id;
    private UserSummaryDto user;
    private GroupRole role;
    private Instant joinedAt;

    public static GroupMemberDto from(GroupMember member) {
        return GroupMemberDto.builder()
                .id(member.getId())
                .user(UserSummaryDto.from(member.getUser()))
                .role(member.getRole())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
