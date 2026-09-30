package com.nexora.follow.dto;

import com.nexora.follow.entity.FollowRequest;
import com.nexora.follow.entity.FollowRequestStatus;
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
public class FollowRequestDto {
    private Long id;
    private UserSummaryDto sender;
    private FollowRequestStatus status;
    private Instant createdAt;

    public static FollowRequestDto from(FollowRequest request) {
        return FollowRequestDto.builder()
                .id(request.getId())
                .sender(UserSummaryDto.from(request.getSender()))
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
