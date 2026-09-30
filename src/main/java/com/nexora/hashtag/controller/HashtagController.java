package com.nexora.hashtag.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.hashtag.dto.HashtagDto;
import com.nexora.hashtag.service.HashtagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hashtags")
@RequiredArgsConstructor
@Tag(name = "Hashtags", description = "Trending topics and hashtag metadata")
public class HashtagController {

    private final HashtagService hashtagService;

    @GetMapping("/{name}")
    @Operation(summary = "Get hashtag details and count by name")
    public ResponseEntity<ApiResponse<HashtagDto>> getHashtag(@PathVariable String name) {
        return ResponseEntity.ok(ApiResponse.ok(hashtagService.getHashtag(name)));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get top trending technical hashtags (cached with Redis)")
    public ResponseEntity<ApiResponse<List<HashtagDto>>> getTrending(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(hashtagService.getTrendingHashtags(limit)));
    }
}
