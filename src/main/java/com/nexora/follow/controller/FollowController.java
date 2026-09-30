package com.nexora.follow.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.follow.service.FollowService;
import com.nexora.user.dto.UserSummaryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Follow & Network", description = "Follow social connections, follow requests, and network listings")
public class FollowController {

    private final FollowService followService;

    @PostMapping("/users/{id}/follow")
    @Operation(summary = "Follow a user directly")
    public ResponseEntity<ApiResponse<Void>> followUser(@PathVariable Long id) {
        followService.followUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Now following user"));
    }

    @DeleteMapping("/users/{id}/follow")
    @Operation(summary = "Unfollow a user")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(@PathVariable Long id) {
        followService.unfollowUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Unfollowed user successfully"));
    }

    @PostMapping("/users/{id}/follow-request")
    @Operation(summary = "Send a follow request for private accounts")
    public ResponseEntity<ApiResponse<Void>> sendFollowRequest(@PathVariable Long id) {
        followService.sendFollowRequest(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Follow request sent"));
    }

    @PostMapping("/follow-requests/{id}/accept")
    @Operation(summary = "Accept an incoming follow request")
    public ResponseEntity<ApiResponse<Void>> acceptFollowRequest(@PathVariable Long id) {
        followService.acceptFollowRequest(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Follow request accepted"));
    }

    @PostMapping("/follow-requests/{id}/reject")
    @Operation(summary = "Reject an incoming follow request")
    public ResponseEntity<ApiResponse<Void>> rejectFollowRequest(@PathVariable Long id) {
        followService.rejectFollowRequest(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Follow request rejected"));
    }

    @GetMapping("/users/{username}/followers")
    @Operation(summary = "Get list of followers for a user")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryDto>>> getFollowers(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(followService.getFollowers(username, page, size)));
    }

    @GetMapping("/users/{username}/following")
    @Operation(summary = "Get list of users followed by target user")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryDto>>> getFollowing(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(followService.getFollowing(username, page, size)));
    }
}
