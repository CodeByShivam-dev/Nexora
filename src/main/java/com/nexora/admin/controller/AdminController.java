package com.nexora.admin.controller;

import com.nexora.admin.dto.AdminStatsDto;
import com.nexora.admin.service.AdminService;
import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.user.dto.UserDto;
import com.nexora.user.entity.UserStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor

// Restricts every endpoint in this controller to users with the ADMIN role.
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Platform analytics, user lifecycle governance, and administrative oversight")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get high-level platform health and entity statistics (Admin only)")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getPlatformStats() {
        // Returns platform statistics for the admin dashboard.
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPlatformStats()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users with pagination (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // Returns a specific page of users instead of loading the entire user list.
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers(page, size)));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Change a user's status: ACTIVE, SUSPENDED, DEACTIVATED (Admin only)")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status
    ) {
        // Delegates the status change and its business rules to the service layer.
        adminService.updateUserStatus(id, status);

        return ResponseEntity.ok(
                ApiResponse.ok(null, "User status updated to " + status)
        );
    }
}