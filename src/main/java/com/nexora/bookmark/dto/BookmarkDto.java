package com.nexora.bookmark.dto;

import com.nexora.post.dto.PostDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {
    private Long id;
    private PostDto post;
    private Instant savedAt;
}
