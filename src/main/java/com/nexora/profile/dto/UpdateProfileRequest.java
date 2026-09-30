package com.nexora.profile.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "Display name cannot exceed 100 characters")
    private String displayName;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @Pattern(regexp = "^(https?://.+)?$", message = "Website must be a valid HTTP or HTTPS URL")
    @Size(max = 255, message = "Website URL cannot exceed 255 characters")
    private String website;

    @Size(max = 512, message = "Avatar URL cannot exceed 512 characters")
    private String avatarUrl;

    @Size(max = 512, message = "Cover image URL cannot exceed 512 characters")
    private String coverImageUrl;

    @Size(max = 500, message = "Interests cannot exceed 500 characters")
    private String interests;

    @Size(max = 150, message = "Work description cannot exceed 150 characters")
    private String work;

    @Size(max = 150, message = "Education description cannot exceed 150 characters")
    private String education;
}
