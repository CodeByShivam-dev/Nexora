package com.nexora.page.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.page.dto.CreatePageRequest;
import com.nexora.page.dto.PageDto;
import com.nexora.page.service.SocialPageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
@Tag(name = "Pages", description = "Brand, organization, and technical publication pages")
public class PageController {

    private final SocialPageService pageService;

    @PostMapping
    @Operation(summary = "Create a brand or social page")
    public ResponseEntity<ApiResponse<PageDto>> createPage(@Valid @RequestBody CreatePageRequest request) {
        PageDto page = pageService.createPage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(page, "Page created successfully"));
    }

    @PostMapping("/{id}/follow")
    @Operation(summary = "Follow a page")
    public ResponseEntity<ApiResponse<Void>> followPage(@PathVariable Long id) {
        pageService.followPage(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Now following page"));
    }

    @DeleteMapping("/{id}/follow")
    @Operation(summary = "Unfollow a page")
    public ResponseEntity<ApiResponse<Void>> unfollowPage(@PathVariable Long id) {
        pageService.unfollowPage(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Unfollowed page"));
    }

    @GetMapping("/discover")
    @Operation(summary = "Discover technical and brand pages")
    public ResponseEntity<ApiResponse<PagedResponse<PageDto>>> getDiscoverPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(pageService.getDiscoverPages(page, size)));
    }

    @GetMapping("/following")
    @Operation(summary = "Get pages followed by the current user")
    public ResponseEntity<ApiResponse<PagedResponse<PageDto>>> getFollowedPages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(pageService.getFollowedPages(page, size)));
    }
}
