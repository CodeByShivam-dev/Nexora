package com.nexora.block.entity;

import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "mutes", uniqueConstraints = {
        @UniqueConstraint(name = "uq_muter_muted", columnNames = {"muter_id", "muted_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "muter_id", nullable = false)
    private User muter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "muted_id", nullable = false)
    private User muted;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
