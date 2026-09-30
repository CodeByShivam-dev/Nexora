package com.nexora.message.repository;

import com.nexora.message.entity.Conversation;
import com.nexora.message.entity.ConversationMember;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

    List<ConversationMember> findByConversation(Conversation conversation);

    Optional<ConversationMember> findByConversationAndUser(Conversation conversation, User user);

    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);
}
