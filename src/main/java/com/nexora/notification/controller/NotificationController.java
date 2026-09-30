package com.nexora.notification.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.notification.dto.NotificationDto;
import com.nexora.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User activity alerts, mentions, and read states")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(page, size)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get total unread notifications count for badge display")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount()));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok(null, "All notifications marked as read"));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markSingleAsRead(@PathVariable Long id) {
        notificationService.markSingleRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
