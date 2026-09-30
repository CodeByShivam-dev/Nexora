package com.nexora.block.controller;

import com.nexora.block.service.BlockMuteService;
import com.nexora.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{id}")
@RequiredArgsConstructor
@Tag(name = "Block & Mute", description = "User safety, blocking, and muting")
public class BlockMuteController {

    private final BlockMuteService blockMuteService;

    @PostMapping("/block")
    @Operation(summary = "Block a user to prevent interactions and hide content")
    public ResponseEntity<ApiResponse<Void>> blockUser(@PathVariable Long id) {
        blockMuteService.blockUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User blocked successfully"));
    }

    @DeleteMapping("/block")
    @Operation(summary = "Unblock a user")
    public ResponseEntity<ApiResponse<Void>> unblockUser(@PathVariable Long id) {
        blockMuteService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User unblocked successfully"));
    }

    @PostMapping("/mute")
    @Operation(summary = "Mute a user's notifications and updates")
    public ResponseEntity<ApiResponse<Void>> muteUser(@PathVariable Long id) {
        blockMuteService.muteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User muted successfully"));
    }

    @DeleteMapping("/mute")
    @Operation(summary = "Unmute a user")
    public ResponseEntity<ApiResponse<Void>> unmuteUser(@PathVariable Long id) {
        blockMuteService.unmuteUser(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "User unmuted successfully"));
    }
}
