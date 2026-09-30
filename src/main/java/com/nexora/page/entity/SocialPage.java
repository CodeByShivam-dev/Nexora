package com.nexora.page.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialPage extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "followers_count", nullable = false)
    @Builder.Default
    private int followersCount = 0;
}
