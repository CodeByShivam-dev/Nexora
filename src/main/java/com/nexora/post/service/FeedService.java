package com.nexora.post.service;

import com.nexora.bookmark.repository.BookmarkRepository;
import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.like.repository.PostLikeRepository;
import com.nexora.post.dto.PostDto;
import com.nexora.post.entity.Post;
import com.nexora.post.repository.PostRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;

    @Transactional(readOnly = true)
    public PagedResponse<PostDto> getFeed(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 50); // Enforce size <= 50 (Section 14)
        Pageable pageable = PageRequest.of(safePage, safeSize);

        Page<Post> postsPage;
        Long currentUserId = null;

        if (SecurityUtils.isAuthenticated()) {
            currentUserId = SecurityUtils.getCurrentUserId();
            postsPage = postRepository.findPersonalizedFeed(currentUserId, pageable);
        } else {
            postsPage = postRepository.findPublicFeed(pageable);
        }

        final Long finalUserId = currentUserId;
        Page<PostDto> dtoPage = postsPage.map(post -> {
            boolean liked = finalUserId != null && likeRepository.existsByPostIdAndUserId(post.getId(), finalUserId);
            boolean saved = finalUserId != null && bookmarkRepository.existsByPostIdAndUserId(post.getId(), finalUserId);
            return PostDto.from(post, liked, saved);
        });

        return PagedResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PostDto> getUserPosts(String username, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        User author = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User @" + username + " not found"));

        Page<Post> postsPage = postRepository.findByAuthor(author, pageable);

        Long currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;

        Page<PostDto> dtoPage = postsPage.map(post -> {
            boolean liked = currentUserId != null && likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            boolean saved = currentUserId != null && bookmarkRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            return PostDto.from(post, liked, saved);
        });

        return PagedResponse.from(dtoPage);
    }
}
