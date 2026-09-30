package com.nexora.post.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.post.dto.CreatePostRequest;
import com.nexora.post.dto.PostDto;
import com.nexora.post.dto.UpdatePostRequest;
import com.nexora.post.service.FeedService;
import com.nexora.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post creation, updates, soft deletion, and retrieval")
public class PostController {

    private final PostService postService;
    private final FeedService feedService;

    @PostMapping
    @Operation(summary = "Create and publish a new post")
    public ResponseEntity<ApiResponse<PostDto>> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostDto post = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(post, "Post published successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single post by ID")
    public ResponseEntity<ApiResponse<PostDto>> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(postService.getPostById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing post owned by the caller")
    public ResponseEntity<ApiResponse<PostDto>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(postService.updatePost(id, request), "Post updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a post")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{username}")
    @Operation(summary = "Get posts published by a specific user")
    public ResponseEntity<ApiResponse<PagedResponse<PostDto>>> getUserPosts(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feedService.getUserPosts(username, page, size)));
    }
}
