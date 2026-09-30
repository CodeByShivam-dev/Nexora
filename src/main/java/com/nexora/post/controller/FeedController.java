package com.nexora.post.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.post.dto.PostDto;
import com.nexora.post.service.FeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Tag(name = "News Feed", description = "Personalized and public chronological news feed")
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    @Operation(summary = "Get chronological news feed with pagination (max 50 per page)")
    public ResponseEntity<ApiResponse<PagedResponse<PostDto>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(feedService.getFeed(page, size)));
    }
}
