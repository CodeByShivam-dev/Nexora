package com.nexora.user.service;

import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.security.SecurityUtils;
import com.nexora.user.dto.UserDto;
import com.nexora.user.dto.UserSummaryDto;
import com.nexora.user.entity.User;
import com.nexora.user.entity.UserStatus;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDto getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User @" + username + " not found"));
        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getSuggestedUsers(int limit) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        int safeLimit = Math.min(Math.max(1, limit), 20);
        List<User> suggestions = userRepository.findSuggestedUsers(currentUserId, PageRequest.of(0, safeLimit));
        return suggestions.stream().map(UserSummaryDto::from).toList();
    }

    @Transactional
    public void deactivateAccount() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.DEACTIVATED);
        userRepository.save(user);
    }
}
