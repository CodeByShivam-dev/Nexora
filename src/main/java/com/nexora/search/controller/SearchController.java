package com.nexora.search.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.search.dto.SearchResultDto;
import com.nexora.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Global multi-entity search across people, posts, communities, pages, and hashtags")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search across users, posts, groups, pages, and hashtags")
    public ResponseEntity<ApiResponse<SearchResultDto>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(searchService.searchAll(q, limit)));
    }
}
