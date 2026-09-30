package com.nexora.hashtag.entity;

import com.nexora.post.entity.Post;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_hashtags")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hashtag_id", nullable = false)
    private Hashtag hashtag;
}
