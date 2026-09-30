package com.nexora.message.entity;

import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "conversation_members", uniqueConstraints = {
        @UniqueConstraint(name = "uq_conv_member", columnNames = {"conversation_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Column(name = "last_read_at")
    private Instant lastReadAt;
}
