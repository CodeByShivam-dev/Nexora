package com.nexora.message.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.message.dto.ConversationDto;
import com.nexora.message.dto.MessageDto;
import com.nexora.message.dto.SendMessageRequest;
import com.nexora.message.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Direct Messaging", description = "Direct conversations, instant messages, and read markers")
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/messages")
    @Operation(summary = "Send a new message to a conversation or user")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageDto message = messageService.sendMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(message, "Message sent successfully"));
    }

    @GetMapping("/conversations")
    @Operation(summary = "Get current user active conversations with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ConversationDto>>> getConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getUserConversations(page, size)));
    }

    @GetMapping("/conversations/{id}/messages")
    @Operation(summary = "Get paginated message history for a conversation")
    public ResponseEntity<ApiResponse<PagedResponse<MessageDto>>> getMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getMessages(id, page, size)));
    }

    @PatchMapping("/conversations/{id}/read")
    @Operation(summary = "Mark conversation messages as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        messageService.markConversationRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Conversation marked as read"));
    }
}
