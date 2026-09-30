package com.nexora.message.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "media_url", length = 512)
    private String mediaUrl;

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;
}
