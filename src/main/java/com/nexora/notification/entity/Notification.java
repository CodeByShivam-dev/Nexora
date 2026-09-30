package com.nexora.notification.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_type", length = 50)
    private String targetType;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;
}
