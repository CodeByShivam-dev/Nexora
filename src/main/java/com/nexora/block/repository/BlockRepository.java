package com.nexora.block.repository;

import com.nexora.block.entity.Block;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {

    boolean existsByBlockerAndBlocked(User blocker, User blocked);

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    Optional<Block> findByBlockerAndBlocked(User blocker, User blocked);

    void deleteByBlockerAndBlocked(User blocker, User blocked);

    default boolean isBlockedEitherWay(Long user1Id, Long user2Id) {
        return existsByBlockerIdAndBlockedId(user1Id, user2Id) || existsByBlockerIdAndBlockedId(user2Id, user1Id);
    }
}
