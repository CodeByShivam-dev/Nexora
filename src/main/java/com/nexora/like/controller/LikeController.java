package com.nexora.like.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.like.service.LikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@RequiredArgsConstructor
@Tag(name = "Likes", description = "Post like and unlike actions")
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    @Operation(summary = "Like a post")
    public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable Long postId) {
        likeService.likePost(postId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post liked successfully"));
    }

    @DeleteMapping
    @Operation(summary = "Unlike a post")
    public ResponseEntity<ApiResponse<Void>> unlikePost(@PathVariable Long postId) {
        likeService.unlikePost(postId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post unliked successfully"));
    }
}
