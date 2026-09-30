package com.nexora.bookmark.controller;

import com.nexora.bookmark.service.BookmarkService;
import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.post.dto.PostDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Saving and retrieving bookmarked posts")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/posts/{postId}/bookmark")
    @Operation(summary = "Save a post to personal bookmarks")
    public ResponseEntity<ApiResponse<Void>> bookmarkPost(@PathVariable Long postId) {
        bookmarkService.bookmarkPost(postId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post bookmarked successfully"));
    }

    @DeleteMapping("/posts/{postId}/bookmark")
    @Operation(summary = "Remove a post from personal bookmarks")
    public ResponseEntity<ApiResponse<Void>> unbookmarkPost(@PathVariable Long postId) {
        bookmarkService.unbookmarkPost(postId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Post removed from bookmarks"));
    }

    @GetMapping("/bookmarks")
    @Operation(summary = "Get user bookmarked posts with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<PostDto>>> getBookmarkedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(bookmarkService.getBookmarkedPosts(page, size)));
    }
}
