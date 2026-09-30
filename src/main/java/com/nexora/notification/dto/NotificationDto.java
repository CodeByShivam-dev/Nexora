package com.nexora.notification.dto;

import com.nexora.notification.entity.Notification;
import com.nexora.notification.entity.NotificationType;
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
public class NotificationDto {
    private Long id;
    private UserSummaryDto actor;
    private NotificationType type;
    private Long targetId;
    private String targetType;
    private String message;
    private boolean read;
    private Instant createdAt;

    public static NotificationDto from(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .actor(notification.getActor() != null ? UserSummaryDto.from(notification.getActor()) : null)
                .type(notification.getType())
                .targetId(notification.getTargetId())
                .targetType(notification.getTargetType())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
