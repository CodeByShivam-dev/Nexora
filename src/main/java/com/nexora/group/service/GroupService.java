package com.nexora.group.service;

import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.BusinessException;
import com.nexora.common.exception.ForbiddenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.group.dto.CreateGroupRequest;
import com.nexora.group.dto.GroupDto;
import com.nexora.group.dto.GroupMemberDto;
import com.nexora.group.dto.UpdateGroupRequest;
import com.nexora.group.entity.Group;
import com.nexora.group.entity.GroupMember;
import com.nexora.group.entity.GroupPrivacy;
import com.nexora.group.entity.GroupRole;
import com.nexora.group.repository.GroupMemberRepository;
import com.nexora.group.repository.GroupRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupDto createGroup(CreateGroupRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Group group = Group.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .privacy(request.getPrivacy() != null ? request.getPrivacy() : GroupPrivacy.PUBLIC)
                .owner(owner)
                .membersCount(1)
                .build();

        group = groupRepository.save(group);

        GroupMember ownerMember = GroupMember.builder()
                .group(group)
                .user(owner)
                .role(GroupRole.OWNER)
                .build();
        memberRepository.save(ownerMember);

        return GroupDto.from(group, true);
    }

    @Transactional
    public GroupDto updateGroup(Long groupId, UpdateGroupRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID " + groupId));

        boolean isAuthorized = memberRepository.existsByGroupIdAndUserIdAndRoleIn(
                groupId, currentUserId, List.of(GroupRole.OWNER, GroupRole.ADMIN)
        );

        if (!isAuthorized) {
            throw new ForbiddenException("Only group owners and admins can update group details");
        }

        if (request.getName() != null) group.setName(request.getName().trim());
        if (request.getDescription() != null) group.setDescription(request.getDescription().trim());
        if (request.getAvatarUrl() != null) group.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getCoverUrl() != null) group.setCoverUrl(request.getCoverUrl().trim());
        if (request.getPrivacy() != null) group.setPrivacy(request.getPrivacy());

        group = groupRepository.save(group);
        return GroupDto.from(group, true);
    }

    @Transactional
    public void joinGroup(Long groupId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID " + groupId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (memberRepository.existsByGroupIdAndUserId(groupId, currentUserId)) {
            // Already a member (Section 24: duplicate membership edge case)
            return;
        }

        if (group.getPrivacy() == GroupPrivacy.PRIVATE) {
            throw new BusinessException("Joining a private group requires an invitation from an administrator");
        }

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupRole.MEMBER)
                .build();
        memberRepository.save(member);

        group.setMembersCount((int) memberRepository.countByGroup(group));
        groupRepository.save(group);
    }

    @Transactional
    public void leaveGroup(Long groupId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID " + groupId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (group.getOwner().getId().equals(currentUserId)) {
            throw new BusinessException("Group owner cannot leave the group. Please transfer ownership first or delete the group.");
        }

        memberRepository.deleteByGroupAndUser(group, user);

        group.setMembersCount((int) memberRepository.countByGroup(group));
        groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public PagedResponse<GroupDto> getDiscoverGroups(int page, int size) {
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Group> groupsPage = groupRepository.findByPrivacy(GroupPrivacy.PUBLIC, pageable);

        Long currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;

        Page<GroupDto> dtoPage = groupsPage.map(g -> {
            boolean isJoined = currentUserId != null && memberRepository.existsByGroupIdAndUserId(g.getId(), currentUserId);
            return GroupDto.from(g, isJoined);
        });

        return PagedResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<GroupDto> getUserGroups(int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Group> groupsPage = groupRepository.findGroupsByUserId(currentUserId, pageable);
        return PagedResponse.from(groupsPage.map(g -> GroupDto.from(g, true)));
    }

    @Transactional(readOnly = true)
    public PagedResponse<GroupMemberDto> getGroupMembers(Long groupId, int page, int size) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<GroupMember> memberPage = memberRepository.findByGroup(group, pageable);
        return PagedResponse.from(memberPage.map(GroupMemberDto::from));
    }
}
