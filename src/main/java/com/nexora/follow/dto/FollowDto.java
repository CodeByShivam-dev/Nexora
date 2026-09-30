package com.nexora.follow.dto;

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
public class FollowDto {
    private Long id;
    private UserSummaryDto user;
    private Instant createdAt;
}
