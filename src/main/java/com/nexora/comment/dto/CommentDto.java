package com.nexora.comment.dto;

import com.nexora.comment.entity.Comment;
import com.nexora.user.dto.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long id;
    private Long postId;
    private UserSummaryDto author;
    private String content;
    private Long parentCommentId;
    private List<CommentDto> replies;
    private Instant createdAt;
    private Instant updatedAt;

    public static CommentDto from(Comment comment, List<CommentDto> replies) {
        return CommentDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .author(UserSummaryDto.from(comment.getAuthor()))
                .content(comment.getContent())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(replies)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
