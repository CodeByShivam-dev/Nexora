package com.nexora.user.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.profile.dto.ProfileDto;
import com.nexora.profile.dto.UpdateProfileRequest;
import com.nexora.profile.service.ProfileService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.dto.UserDto;
import com.nexora.user.dto.UserSummaryDto;
import com.nexora.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users & Profiles", description = "User accounts, public profiles, profile customization, and discovery suggestions")
public class UserController {

    private final UserService userService;
    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user's profile and account data")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentUser()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<ProfileDto>> updateCurrentProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProfileDto updated = profileService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Profile updated successfully"));
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get public user profile by username")
    public ResponseEntity<ApiResponse<UserDto>> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserByUsername(username)));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get People You May Know based on social graph connections")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getSuggestedUsers(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getSuggestedUsers(limit)));
    }

    @PostMapping("/deactivate")
    @Operation(summary = "Deactivate current user account")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount() {
        userService.deactivateAccount();
        return ResponseEntity.ok(ApiResponse.ok(null, "Account deactivated successfully"));
    }
}
