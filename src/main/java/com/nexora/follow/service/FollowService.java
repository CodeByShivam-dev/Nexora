package com.nexora.follow.service;

import com.nexora.block.repository.BlockRepository;
import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.BusinessException;
import com.nexora.common.exception.ForbiddenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.follow.dto.FollowRequestDto;
import com.nexora.follow.entity.Follow;
import com.nexora.follow.entity.FollowRequest;
import com.nexora.follow.entity.FollowRequestStatus;
import com.nexora.follow.repository.FollowRepository;
import com.nexora.follow.repository.FollowRequestRepository;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.service.NotificationService;
import com.nexora.security.RateLimiterService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.dto.UserSummaryDto;
import com.nexora.user.entity.User;
import com.nexora.user.entity.UserStatus;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final FollowRequestRepository followRequestRepository;
    private final UserRepository userRepository;
    private final BlockRepository blockRepository;
    private final NotificationService notificationService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public void followUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        rateLimiterService.checkFollowLimit(currentUserId);

        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException("You cannot follow yourself");
        }

        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (target.getStatus() == UserStatus.SUSPENDED) {
            throw new BusinessException("Cannot follow a suspended account");
        }

        if (blockRepository.isBlockedEitherWay(currentUserId, targetUserId)) {
            throw new ForbiddenException("Cannot follow this user due to block restrictions");
        }

        if (followRepository.existsByFollowerAndFollowing(follower, target)) {
            // Already followed (Idempotent, Section 18 & 32)
            return;
        }

        try {
            Follow follow = Follow.builder()
                    .follower(follower)
                    .following(target)
                    .build();
            followRepository.save(follow);

            notificationService.createNotification(
                    target,
                    follower,
                    NotificationType.FOLLOW,
                    follower.getId(),
                    "USER",
                    follower.getUsername() + " started following you"
            );
        } catch (DataIntegrityViolationException ex) {
            // Handled cleanly by database unique constraint
        }
    }

    @Transactional
    public void unfollowUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        followRepository.deleteByFollowerAndFollowing(follower, target);
    }

    @Transactional
    public void sendFollowRequest(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException("You cannot send a follow request to yourself");
        }

        User sender = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User receiver = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (blockRepository.isBlockedEitherWay(currentUserId, targetUserId)) {
            throw new ForbiddenException("Cannot send follow request due to block restrictions");
        }

        if (!followRequestRepository.existsBySenderAndReceiverAndStatus(sender, receiver, FollowRequestStatus.PENDING)) {
            FollowRequest req = FollowRequest.builder()
                    .sender(sender)
                    .receiver(receiver)
                    .status(FollowRequestStatus.PENDING)
                    .build();
            followRequestRepository.save(req);

            notificationService.createNotification(
                    receiver,
                    sender,
                    NotificationType.FOLLOW_REQUEST,
                    req.getId(),
                    "FOLLOW_REQUEST",
                    sender.getUsername() + " requested to follow you"
            );
        }
    }

    @Transactional
    public void acceptFollowRequest(Long requestId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to accept this follow request");
        }

        request.setStatus(FollowRequestStatus.ACCEPTED);
        followRequestRepository.save(request);

        // Create follow link
        Follow follow = Follow.builder()
                .follower(request.getSender())
                .following(request.getReceiver())
                .build();
        followRepository.save(follow);

        notificationService.createNotification(
                request.getSender(),
                request.getReceiver(),
                NotificationType.FOLLOW_ACCEPTED,
                request.getReceiver().getId(),
                "USER",
                request.getReceiver().getUsername() + " accepted your follow request"
        );
    }

    @Transactional
    public void rejectFollowRequest(Long requestId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new ForbiddenException("You are not authorized to reject this follow request");
        }

        request.setStatus(FollowRequestStatus.REJECTED);
        followRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryDto> getFollowers(String username, int page, int size) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User @" + username + " not found"));

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        Page<User> followersPage = followRepository.findFollowersByUser(user, pageable);
        return PagedResponse.from(followersPage.map(UserSummaryDto::from));
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserSummaryDto> getFollowing(String username, int page, int size) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User @" + username + " not found"));

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50));
        Page<User> followingPage = followRepository.findFollowingByUser(user, pageable);
        return PagedResponse.from(followingPage.map(UserSummaryDto::from));
    }
}
