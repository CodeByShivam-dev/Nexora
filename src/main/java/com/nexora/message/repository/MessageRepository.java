package com.nexora.message.repository;

import com.nexora.message.entity.Conversation;
import com.nexora.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m JOIN FETCH m.sender s LEFT JOIN FETCH s.profile WHERE m.conversation = :conversation AND m.deleted = false ORDER BY m.createdAt DESC")
    Page<Message> findByConversation(@Param("conversation") Conversation conversation, Pageable pageable);

    Optional<Message> findTopByConversationAndDeletedFalseOrderByCreatedAtDesc(Conversation conversation);
}
