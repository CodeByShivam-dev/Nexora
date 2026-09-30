package com.nexora.notification.service;

import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.notification.dto.NotificationDto;
import com.nexora.notification.entity.Notification;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.repository.NotificationRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Async("taskExecutor")
    @Transactional
    public void createNotification(User receiver, User actor, NotificationType type, Long targetId, String targetType, String message) {
        if (receiver.getId().equals(actor.getId())) {
            // Do not notify self
            return;
        }

        // Avoid duplicate active notifications (e.g. repeated likes)
        Optional<Notification> existing = notificationRepository
                .findFirstByReceiverAndActorAndTypeAndTargetIdAndTargetType(receiver, actor, type, targetId, targetType);

        if (existing.isPresent()) {
            Notification notif = existing.get();
            notif.setRead(false);
            notif.setMessage(message);
            notificationRepository.save(notif);
            return;
        }

        Notification notification = Notification.builder()
                .receiver(receiver)
                .actor(actor)
                .type(type)
                .targetId(targetId)
                .targetType(targetType)
                .message(message)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> getUserNotifications(int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Notification> notifPage = notificationRepository.findByReceiverOrderByCreatedAtDesc(user, pageable);
        return PagedResponse.from(notifPage.map(NotificationDto::from));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByReceiverAndReadFalse(user);
    }

    @Transactional
    public void markAllRead() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllAsRead(user);
    }

    @Transactional
    public void markSingleRead(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getReceiver().getId().equals(currentUserId)) {
            return;
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
