package com.nexora.page.entity;

import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "page_followers", uniqueConstraints = {
        @UniqueConstraint(name = "uq_page_follower", columnNames = {"page_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageFollower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private SocialPage page;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "followed_at", nullable = false)
    @Builder.Default
    private Instant followedAt = Instant.now();
}
