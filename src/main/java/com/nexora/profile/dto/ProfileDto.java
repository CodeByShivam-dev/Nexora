package com.nexora.profile.dto;

import com.nexora.profile.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private Long id;
    private Long userId;
    private String displayName;
    private String bio;
    private String location;
    private String website;
    private String avatarUrl;
    private String coverImageUrl;
    private String interests;
    private String work;
    private String education;
    private Instant updatedAt;

    public static ProfileDto from(Profile profile) {
        if (profile == null) return null;
        return ProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .website(profile.getWebsite())
                .avatarUrl(profile.getAvatarUrl())
                .coverImageUrl(profile.getCoverImageUrl())
                .interests(profile.getInterests())
                .work(profile.getWork())
                .education(profile.getEducation())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
