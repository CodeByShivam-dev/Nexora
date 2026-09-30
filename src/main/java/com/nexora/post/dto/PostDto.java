package com.nexora.post.dto;

import com.nexora.post.entity.Post;
import com.nexora.post.entity.PostVisibility;
import com.nexora.user.dto.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private UserSummaryDto author;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private PostVisibility visibility;
    private int likesCount;
    private int commentsCount;
    private boolean likedByMe;
    private boolean savedByMe;
    private Instant createdAt;
    private Instant updatedAt;

    public static PostDto from(Post post, boolean likedByMe, boolean savedByMe) {
        return PostDto.builder()
                .id(post.getId())
                .author(UserSummaryDto.from(post.getAuthor()))
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .visibility(post.getVisibility())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .likedByMe(likedByMe)
                .savedByMe(savedByMe)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
