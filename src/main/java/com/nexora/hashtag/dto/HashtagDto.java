package com.nexora.hashtag.dto;

import com.nexora.hashtag.entity.Hashtag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HashtagDto {
    private Long id;
    private String name;
    private int postsCount;

    public static HashtagDto from(Hashtag hashtag) {
        return HashtagDto.builder()
                .id(hashtag.getId())
                .name(hashtag.getName())
                .postsCount(hashtag.getPostsCount())
                .build();
    }
}
