package com.nexora.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private Long conversationId;

    private Long recipientUserId;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String content;

    @Size(max = 512, message = "Media URL cannot exceed 512 characters")
    private String mediaUrl;
}
