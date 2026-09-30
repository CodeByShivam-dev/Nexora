package com.nexora.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nexora.common.entity.BaseEntity;
import com.nexora.profile.entity.Profile;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.PENDING_VERIFICATION;

    @Column(name = "verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "last_seen_at")
    @Builder.Default
    private Instant lastSeenAt = Instant.now();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Profile profile;
}
