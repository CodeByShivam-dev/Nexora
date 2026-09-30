package com.nexora.comment.service;

import com.nexora.comment.dto.CommentDto;
import com.nexora.comment.dto.CreateCommentRequest;
import com.nexora.comment.dto.UpdateCommentRequest;
import com.nexora.comment.entity.Comment;
import com.nexora.comment.repository.CommentRepository;
import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ForbiddenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.common.exception.ValidationException;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.service.NotificationService;
import com.nexora.post.entity.Post;
import com.nexora.post.repository.PostRepository;
import com.nexora.security.RateLimiterService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.Role;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public CommentDto addComment(Long postId, CreateCommentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        rateLimiterService.checkCommentLimit(currentUserId);

        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        if (post.isDeleted()) {
            throw new ValidationException("Cannot comment on a deleted post");
        }

        User author = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment parent = null;
        if (request.getParentCommentId() != null) {
            parent = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));

            if (!parent.getPost().getId().equals(postId)) {
                throw new ValidationException("Parent comment does not belong to the target post");
            }
        }

        Comment comment = Comment.builder()
                .post(post)
                .author(author)
                .parentComment(parent)
                .content(request.getContent().trim())
                .deleted(false)
                .build();

        comment = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // Notify post author
        notificationService.createNotification(
                post.getAuthor(),
                author,
                NotificationType.COMMENT,
                post.getId(),
                "POST",
                author.getUsername() + " commented on your post: \"" + truncate(request.getContent(), 50) + "\""
        );

        // If reply, also notify parent comment author
        if (parent != null && !parent.getAuthor().getId().equals(author.getId())) {
            notificationService.createNotification(
                    parent.getAuthor(),
                    author,
                    NotificationType.COMMENT,
                    post.getId(),
                    "POST",
                    author.getUsername() + " replied to your comment"
            );
        }

        return CommentDto.from(comment, Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<CommentDto> getPostComments(Long postId, int page, int size) {
        Post post = postRepository.findByIdWithAuthor(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID " + postId));

        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Comment> rootComments = commentRepository.findRootCommentsByPost(post, pageable);

        Page<CommentDto> dtoPage = rootComments.map(root -> {
            List<Comment> replies = commentRepository.findRepliesByParentId(root.getId());
            List<CommentDto> replyDtos = replies.stream()
                    .map(r -> CommentDto.from(r, Collections.emptyList()))
                    .toList();
            return CommentDto.from(root, replyDtos);
        });

        return PagedResponse.from(dtoPage);
    }

    @Transactional
    public CommentDto updateComment(Long commentId, UpdateCommentRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Comment comment = commentRepository.findByIdWithAuthor(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID " + commentId));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to edit this comment");
        }

        comment.setContent(request.getContent().trim());
        comment.setUpdatedAt(Instant.now());
        comment = commentRepository.save(comment);

        return CommentDto.from(comment, Collections.emptyList());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = commentRepository.findByIdWithAuthor(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with ID " + commentId));

        boolean isAuthor = comment.getAuthor().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isPostAuthor = comment.getPost().getAuthor().getId().equals(currentUserId);

        if (!isAuthor && !isAdmin && !isPostAuthor) {
            throw new ForbiddenException("You are not authorized to delete this comment");
        }

        comment.setDeleted(true);
        comment.setDeletedAt(Instant.now());
        commentRepository.save(comment);

        Post post = comment.getPost();
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
