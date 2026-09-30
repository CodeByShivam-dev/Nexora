package com.nexora.admin.service;

import com.nexora.admin.dto.AdminStatsDto;
import com.nexora.comment.repository.CommentRepository;
import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.group.repository.GroupRepository;
import com.nexora.post.repository.PostRepository;
import com.nexora.report.entity.ReportStatus;
import com.nexora.report.repository.ReportRepository;
import com.nexora.user.dto.UserDto;
import com.nexora.user.entity.User;
import com.nexora.user.entity.UserStatus;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final GroupRepository groupRepository;
    private final ReportRepository reportRepository;

    @Transactional(readOnly = true)
    public AdminStatsDto getPlatformStats() {

        // Collects lightweight aggregate counts from each domain repository for the admin dashboard.
        long totalUsers = userRepository.count();
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        long totalGroups = groupRepository.count();

        // Only the total number of pending reports is required, so the query fetches the first page with one record.
        long pendingReports = reportRepository
                .findByStatus(ReportStatus.PENDING, PageRequest.of(0, 1))
                .getTotalElements();

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalPosts(totalPosts)
                .totalComments(totalComments)
                .totalGroups(totalGroups)
                .pendingReports(pendingReports)
                .build();
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {

        // Fails fast when the requested user does not exist instead of silently updating nothing.
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with ID " + userId)
                );

        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getAllUsers(int page, int size) {

        // Clamp pagination values to prevent invalid pages and excessively large result sets.
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<User> usersPage = userRepository.findAll(pageable);

        // Converts entities to DTOs before returning them from the service layer.
        return PagedResponse.from(usersPage.map(UserDto::from));
    }
}