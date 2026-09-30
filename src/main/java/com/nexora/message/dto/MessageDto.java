package com.nexora.message.dto;

import com.nexora.message.entity.Message;
import com.nexora.user.dto.UserSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long conversationId;
    private UserSummaryDto sender;
    private String content;
    private String mediaUrl;
    private Instant createdAt;

    public static MessageDto from(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .sender(UserSummaryDto.from(message.getSender()))
                .content(message.getContent())
                .mediaUrl(message.getMediaUrl())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
