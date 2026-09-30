package com.nexora.post.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "media_url", length = 512)
    private String mediaUrl;

    @Column(name = "media_type", length = 50)
    private String mediaType;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 30)
    @Builder.Default
    private PostVisibility visibility = PostVisibility.PUBLIC;

    @Column(name = "likes_count", nullable = false)
    @Builder.Default
    private int likesCount = 0;

    @Column(name = "comments_count", nullable = false)
    @Builder.Default
    private int commentsCount = 0;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
