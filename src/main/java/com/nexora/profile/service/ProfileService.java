package com.nexora.profile.service;

import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.profile.dto.ProfileDto;
import com.nexora.profile.dto.UpdateProfileRequest;
import com.nexora.profile.entity.Profile;
import com.nexora.profile.repository.ProfileRepository;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileDto getProfileByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User @" + username + " does not exist"));

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> Profile.builder().user(user).displayName(user.getUsername()).build());

        return ProfileDto.from(profile);
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID " + userId));
        return ProfileDto.from(profile);
    }

    @Transactional
    public ProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> Profile.builder().user(user).build());

        if (request.getDisplayName() != null) profile.setDisplayName(request.getDisplayName().trim());
        if (request.getBio() != null) profile.setBio(request.getBio().trim());
        if (request.getLocation() != null) profile.setLocation(request.getLocation().trim());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite().trim());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getCoverImageUrl() != null) profile.setCoverImageUrl(request.getCoverImageUrl().trim());
        if (request.getInterests() != null) profile.setInterests(request.getInterests().trim());
        if (request.getWork() != null) profile.setWork(request.getWork().trim());
        if (request.getEducation() != null) profile.setEducation(request.getEducation().trim());
        profile.setUpdatedAt(Instant.now());

        profile = profileRepository.save(profile);
        return ProfileDto.from(profile);
    }
}
