package com.nexora.profile.entity;

import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Column(name = "interests", length = 500)
    private String interests;

    @Column(name = "work", length = 150)
    private String work;

    @Column(name = "education", length = 150)
    private String education;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
