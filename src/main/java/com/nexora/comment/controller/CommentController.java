package com.nexora.comment.controller;

import com.nexora.comment.dto.CommentDto;
import com.nexora.comment.dto.CreateCommentRequest;
import com.nexora.comment.dto.UpdateCommentRequest;
import com.nexora.comment.service.CommentService;
import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Post comments and nested thread discussion replies")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/posts/{postId}/comments")
    @Operation(summary = "Add a comment or nested reply to a post")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        CommentDto comment = commentService.addComment(postId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(comment, "Comment published successfully"));
    }

    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Get root comments and replies for a post with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<CommentDto>>> getPostComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.getPostComments(postId, page, size)));
    }

    @PutMapping("/comments/{id}")
    @Operation(summary = "Update an existing comment owned by the caller")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(commentService.updateComment(id, request), "Comment updated"));
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
