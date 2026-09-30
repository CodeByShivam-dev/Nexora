package com.nexora.like.service;

import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.like.entity.PostLike;
import com.nexora.like.repository.PostLikeRepository;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.service.NotificationService;
import com.nexora.post.entity.Post;
import com.nexora.post.repository.PostRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private static final Logger log = LoggerFactory.getLogger(LikeService.class);

    private final PostLikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void likePost(Long postId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (likeRepository.existsByPostAndUser(post, user)) {
            // Idempotent success (Section 16 & 32)
            return;
        }

        try {
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            likeRepository.save(like);

            post.setLikesCount(post.getLikesCount() + 1);
            postRepository.save(post);

            // Notify post author
            notificationService.createNotification(
                    post.getAuthor(),
                    user,
                    NotificationType.LIKE,
                    post.getId(),
                    "POST",
                    user.getUsername() + " liked your post"
            );
        } catch (DataIntegrityViolationException ex) {
            log.debug("Concurrent duplicate like ignored by DB unique constraint");
        }
    }

    @Transactional
    public void unlikePost(Long postId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        likeRepository.findByPostAndUser(post, user).ifPresent(like -> {
            likeRepository.delete(like);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            postRepository.save(post);
        });
    }
}
