package com.nexora.group.repository;

import com.nexora.group.entity.Group;
import com.nexora.group.entity.GroupPrivacy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    Page<Group> findByPrivacy(GroupPrivacy privacy, Pageable pageable);

    @Query("SELECT g FROM Group g JOIN GroupMember gm ON gm.group = g WHERE gm.user.id = :userId")
    Page<Group> findGroupsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT g FROM Group g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :query, '%')) AND g.privacy = 'PUBLIC'")
    Page<Group> searchGroups(@Param("query") String query, Pageable pageable);

    List<Group> findTop5ByPrivacyOrderByMembersCountDesc(GroupPrivacy privacy);
}
