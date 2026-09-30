package com.nexora.group.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Group extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy", nullable = false, length = 30)
    @Builder.Default
    private GroupPrivacy privacy = GroupPrivacy.PUBLIC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "members_count", nullable = false)
    @Builder.Default
    private int membersCount = 1;
}
