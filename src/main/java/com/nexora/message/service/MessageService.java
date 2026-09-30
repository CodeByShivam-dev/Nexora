package com.nexora.message.service;

import com.nexora.block.repository.BlockRepository;
import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ForbiddenException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.common.exception.ValidationException;
import com.nexora.message.dto.ConversationDto;
import com.nexora.message.dto.MessageDto;
import com.nexora.message.dto.SendMessageRequest;
import com.nexora.message.entity.Conversation;
import com.nexora.message.entity.ConversationMember;
import com.nexora.message.entity.Message;
import com.nexora.message.repository.ConversationMemberRepository;
import com.nexora.message.repository.ConversationRepository;
import com.nexora.message.repository.MessageRepository;
import com.nexora.notification.entity.NotificationType;
import com.nexora.notification.service.NotificationService;
import com.nexora.security.RateLimiterService;
import com.nexora.security.SecurityUtils;
import com.nexora.user.dto.UserSummaryDto;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final BlockRepository blockRepository;
    private final NotificationService notificationService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public MessageDto sendMessage(SendMessageRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        rateLimiterService.checkMessageLimit(currentUserId);

        User sender = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));

        Conversation conversation;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

            if (!memberRepository.existsByConversationIdAndUserId(conversation.getId(), currentUserId)) {
                throw new ForbiddenException("You do not belong to this conversation");
            }
        } else if (request.getRecipientUserId() != null) {
            Long recipientId = request.getRecipientUserId();
            if (currentUserId.equals(recipientId)) {
                throw new ValidationException("Cannot create a direct conversation with yourself");
            }

            if (blockRepository.isBlockedEitherWay(currentUserId, recipientId)) {
                throw new ForbiddenException("Cannot message this user due to block restrictions");
            }

            User recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

            conversation = conversationRepository.findDirectConversationBetween(currentUserId, recipientId)
                    .orElseGet(() -> {
                        Conversation conv = Conversation.builder().group(false).build();
                        conv = conversationRepository.save(conv);

                        memberRepository.save(ConversationMember.builder().conversation(conv).user(sender).build());
                        memberRepository.save(ConversationMember.builder().conversation(conv).user(recipient).build());
                        return conv;
                    });
        } else {
            throw new ValidationException("Either conversationId or recipientUserId must be provided");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent().trim())
                .mediaUrl(request.getMediaUrl())
                .deleted(false)
                .build();

        message = messageRepository.save(message);

        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        // Notify other conversation members
        List<ConversationMember> members = memberRepository.findByConversation(conversation);
        for (ConversationMember member : members) {
            if (!member.getUser().getId().equals(currentUserId)) {
                notificationService.createNotification(
                        member.getUser(),
                        sender,
                        NotificationType.MESSAGE,
                        conversation.getId(),
                        "CONVERSATION",
                        sender.getUsername() + " sent you a message"
                );
            }
        }

        return MessageDto.from(message);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ConversationDto> getUserConversations(int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Conversation> conversationsPage = conversationRepository.findUserConversations(currentUserId, pageable);

        Page<ConversationDto> dtoPage = conversationsPage.map(conv -> {
            List<UserSummaryDto> participants = memberRepository.findByConversation(conv).stream()
                    .map(m -> UserSummaryDto.from(m.getUser()))
                    .toList();

            MessageDto lastMsg = messageRepository.findTopByConversationAndDeletedFalseOrderByCreatedAtDesc(conv)
                    .map(MessageDto::from)
                    .orElse(null);

            return ConversationDto.builder()
                    .id(conv.getId())
                    .title(conv.getTitle())
                    .isGroup(conv.isGroup())
                    .participants(participants)
                    .lastMessage(lastMsg)
                    .updatedAt(conv.getUpdatedAt())
                    .build();
        });

        return PagedResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<MessageDto> getMessages(Long conversationId, int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        if (!memberRepository.existsByConversationIdAndUserId(conversationId, currentUserId)) {
            throw new ForbiddenException("You are not authorized to view messages in this conversation");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Message> messagePage = messageRepository.findByConversation(conversation, pageable);
        return PagedResponse.from(messagePage.map(MessageDto::from));
    }

    @Transactional
    public void markConversationRead(Long conversationId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        memberRepository.findByConversationAndUser(conversation, user).ifPresent(m -> {
            m.setLastReadAt(Instant.now());
            memberRepository.save(m);
        });
    }
}
