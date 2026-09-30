package com.nexora.search.dto;

import com.nexora.group.dto.GroupDto;
import com.nexora.hashtag.dto.HashtagDto;
import com.nexora.page.dto.PageDto;
import com.nexora.post.dto.PostDto;
import com.nexora.user.dto.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private String query;
    private List<UserSummaryDto> users;
    private List<PostDto> posts;
    private List<GroupDto> groups;
    private List<PageDto> pages;
    private List<HashtagDto> hashtags;
}
