package com.nexora.post.service;

import com.nexora.bookmark.repository.BookmarkRepository;
import com.nexora.common.exception.ForbiddenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.hashtag.service.HashtagService;
import com.nexora.like.repository.PostLikeRepository;
import com.nexora.post.dto.CreatePostRequest;
import com.nexora.post.dto.PostDto;
import com.nexora.post.dto.UpdatePostRequest;
import com.nexora.post.entity.Post;
import com.nexora.post.entity.PostVisibility;
import com.nexora.post.repository.PostRepository;
import com.nexora.security.RateLimiterService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.Role;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository likeRepository;
    private final BookmarkRepository bookmarkRepository;
    private final HashtagService hashtagService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public PostDto createPost(CreatePostRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        rateLimiterService.checkPostCreationLimit(currentUserId);

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Post post = Post.builder()
                .author(author)
                .content(request.getContent().trim())
                .mediaUrl(request.getMediaUrl())
                .mediaType(request.getMediaType())
                .visibility(request.getVisibility() != null ? request.getVisibility() : PostVisibility.PUBLIC)
                .likesCount(0)
                .commentsCount(0)
                .deleted(false)
                .build();

        post = postRepository.save(post);

        // Extract and map hashtags
        hashtagService.processHashtagsForPost(post, post.getContent());

        return PostDto.from(post, false, false);
    }

    @Transactional(readOnly = true)
    public PostDto getPostById(Long id) {
        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + id));

        boolean likedByMe = false;
        boolean savedByMe = false;

        if (SecurityUtils.isAuthenticated()) {
            Long currentUserId = SecurityUtils.getCurrentUserId();
            likedByMe = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            savedByMe = bookmarkRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        }

        return PostDto.from(post, likedByMe, savedByMe);
    }

    @Transactional
    public PostDto updatePost(Long id, UpdatePostRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + id));

        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to edit this post");
        }

        post.setContent(request.getContent().trim());
        if (request.getVisibility() != null) {
            post.setVisibility(request.getVisibility());
        }
        post.setUpdatedAt(Instant.now());

        post = postRepository.save(post);

        boolean liked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        boolean saved = bookmarkRepository.existsByPostIdAndUserId(post.getId(), currentUserId);

        return PostDto.from(post, liked, saved);
    }

    @Transactional
    public void deletePost(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Post post = postRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + id));

        boolean isAuthor = post.getAuthor().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("You do not have permission to delete this post");
        }

        // Soft deletion (Section 43)
        post.setDeleted(true);
        post.setDeletedAt(Instant.now());
        postRepository.save(post);
    }
}
