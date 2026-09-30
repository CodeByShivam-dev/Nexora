package com.nexora.message.repository;

import com.nexora.message.entity.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN ConversationMember cm ON cm.conversation = c WHERE cm.user.id = :userId ORDER BY c.updatedAt DESC")
    Page<Conversation> findUserConversations(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Conversation c JOIN ConversationMember cm1 ON cm1.conversation = c JOIN ConversationMember cm2 ON cm2.conversation = c WHERE c.group = false AND cm1.user.id = :user1Id AND cm2.user.id = :user2Id")
    Optional<Conversation> findDirectConversationBetween(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
