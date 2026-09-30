package com.nexora.block.service;

import com.nexora.block.entity.Block;
import com.nexora.block.entity.Mute;
import com.nexora.block.repository.BlockRepository;
import com.nexora.block.repository.MuteRepository;
import com.nexora.common.exception.BusinessException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.follow.repository.FollowRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BlockMuteService {

    private final BlockRepository blockRepository;
    private final MuteRepository muteRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    @Transactional
    public void blockUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException("You cannot block yourself");
        }

        User blocker = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User blocked = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (!blockRepository.existsByBlockerAndBlocked(blocker, blocked)) {
            Block block = Block.builder()
                    .blocker(blocker)
                    .blocked(blocked)
                    .build();
            blockRepository.save(block);

            // Sever follow connections in both directions
            followRepository.deleteByFollowerAndFollowing(blocker, blocked);
            followRepository.deleteByFollowerAndFollowing(blocked, blocker);
        }
    }

    @Transactional
    public void unblockUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User blocker = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User blocked = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        blockRepository.deleteByBlockerAndBlocked(blocker, blocked);
    }

    @Transactional
    public void muteUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException("You cannot mute yourself");
        }

        User muter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User muted = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (!muteRepository.existsByMuterAndMuted(muter, muted)) {
            Mute mute = Mute.builder()
                    .muter(muter)
                    .muted(muted)
                    .build();
            muteRepository.save(mute);
        }
    }

    @Transactional
    public void unmuteUser(Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User muter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User muted = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        muteRepository.deleteByMuterAndMuted(muter, muted);
    }
}
