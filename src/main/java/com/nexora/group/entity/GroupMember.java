package com.nexora.group.entity;

import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "group_members", uniqueConstraints = {
        @UniqueConstraint(name = "uq_group_member", columnNames = {"group_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private GroupRole role = GroupRole.MEMBER;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
