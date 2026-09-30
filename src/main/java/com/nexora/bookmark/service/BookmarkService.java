package com.nexora.bookmark.service;

import com.nexora.bookmark.entity.Bookmark;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private static final Logger log = LoggerFactory.getLogger(BookmarkService.class);

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository likeRepository;

    @Transactional
    public void bookmarkPost(Long postId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (bookmarkRepository.existsByPostAndUser(post, user)) {
            return;
        }

        try {
            Bookmark bookmark = Bookmark.builder()
                    .post(post)
                    .user(user)
                    .build();
            bookmarkRepository.save(bookmark);
        } catch (DataIntegrityViolationException ex) {
            log.debug("Concurrent duplicate bookmark caught by unique constraint");
        }
    }

    @Transactional
    public void unbookmarkPost(Long postId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        bookmarkRepository.findByPostAndUser(post, user).ifPresent(bookmarkRepository::delete);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PostDto> getBookmarkedPosts(int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Post> postsPage = bookmarkRepository.findBookmarkedPostsByUser(user, pageable);

        Page<PostDto> dtoPage = postsPage.map(post -> {
            boolean liked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            return PostDto.from(post, liked, true);
        });

        return PagedResponse.from(dtoPage);
    }
}
