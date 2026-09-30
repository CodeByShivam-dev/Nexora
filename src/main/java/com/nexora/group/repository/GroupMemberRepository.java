package com.nexora.group.repository;

import com.nexora.group.entity.Group;
import com.nexora.group.entity.GroupMember;
import com.nexora.group.entity.GroupRole;
import com.nexora.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Optional<GroupMember> findByGroupAndUser(Group group, User user);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    Page<GroupMember> findByGroup(Group group, Pageable pageable);

    void deleteByGroupAndUser(Group group, User user);

    long countByGroup(Group group);

    boolean existsByGroupIdAndUserIdAndRoleIn(Long groupId, Long userId, java.util.Collection<GroupRole> roles);
}
