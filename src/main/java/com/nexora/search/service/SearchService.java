package com.nexora.search.service;

import com.nexora.common.exception.ValidationException;
import com.nexora.group.dto.GroupDto;
import com.nexora.group.repository.GroupRepository;
import com.nexora.hashtag.dto.HashtagDto;
import com.nexora.hashtag.repository.HashtagRepository;
import com.nexora.page.dto.PageDto;
import com.nexora.page.repository.SocialPageRepository;
import com.nexora.post.dto.PostDto;
import com.nexora.post.repository.PostRepository;
import com.nexora.search.dto.SearchResultDto;
import com.nexora.security.RateLimiterService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.dto.UserSummaryDto;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final GroupRepository groupRepository;
    private final SocialPageRepository pageRepository;
    private final HashtagRepository hashtagRepository;
    private final RateLimiterService rateLimiterService;

    @Transactional(readOnly = true)
    public SearchResultDto searchAll(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            throw new ValidationException("Search query must be at least 2 characters long");
        }

        String sanitized = query.trim();

        if (SecurityUtils.isAuthenticated()) {
            rateLimiterService.checkSearchLimit(SecurityUtils.getCurrentUserId());
        }

        int safeLimit = Math.min(Math.max(1, limit), 20);
        Pageable pageable = PageRequest.of(0, safeLimit);

        List<UserSummaryDto> users = userRepository.searchUsers(sanitized, pageable)
                .getContent().stream().map(UserSummaryDto::from).toList();

        List<PostDto> posts = postRepository.searchPosts(sanitized, pageable)
                .getContent().stream().map(p -> PostDto.from(p, false, false)).toList();

        List<GroupDto> groups = groupRepository.searchGroups(sanitized, pageable)
                .getContent().stream().map(g -> GroupDto.from(g, false)).toList();

        List<PageDto> pages = pageRepository.searchPages(sanitized, pageable)
                .getContent().stream().map(p -> PageDto.from(p, false)).toList();

        List<HashtagDto> hashtags = hashtagRepository.searchHashtags(sanitized, pageable)
                .stream().map(HashtagDto::from).toList();

        return SearchResultDto.builder()
                .query(sanitized)
                .users(users)
                .posts(posts)
                .groups(groups)
                .pages(pages)
                .hashtags(hashtags)
                .build();
    }
}
