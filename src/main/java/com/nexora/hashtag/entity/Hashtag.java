package com.nexora.hashtag.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "hashtags")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "posts_count", nullable = false)
    @Builder.Default
    private int postsCount = 0;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
