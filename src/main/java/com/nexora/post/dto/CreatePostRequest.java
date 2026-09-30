package com.nexora.post.dto;

import com.nexora.post.entity.PostVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Post content cannot be empty")
    @Size(max = 5000, message = "Post content cannot exceed 5000 characters")
    private String content;

    @Size(max = 512, message = "Media URL cannot exceed 512 characters")
    private String mediaUrl;

    @Size(max = 50, message = "Media type cannot exceed 50 characters")
    private String mediaType;

    @Builder.Default
    private PostVisibility visibility = PostVisibility.PUBLIC;
}
