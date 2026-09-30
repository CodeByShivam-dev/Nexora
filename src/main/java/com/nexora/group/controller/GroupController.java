package com.nexora.group.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.group.dto.CreateGroupRequest;
import com.nexora.group.dto.GroupDto;
import com.nexora.group.dto.GroupMemberDto;
import com.nexora.group.dto.UpdateGroupRequest;
import com.nexora.group.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Communities & Groups", description = "Community discovery, member management, and role-based permissions")
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @Operation(summary = "Create a new community group")
    public ResponseEntity<ApiResponse<GroupDto>> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        GroupDto group = groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(group, "Group created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing group (Owner or Admin only)")
    public ResponseEntity<ApiResponse<GroupDto>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGroupRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.updateGroup(id, request), "Group updated"));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join a public group")
    public ResponseEntity<ApiResponse<Void>> joinGroup(@PathVariable Long id) {
        groupService.joinGroup(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Joined group successfully"));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "Leave a group")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(@PathVariable Long id) {
        groupService.leaveGroup(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Left group successfully"));
    }

    @GetMapping("/discover")
    @Operation(summary = "Discover public groups with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<GroupDto>>> getDiscoverGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getDiscoverGroups(page, size)));
    }

    @GetMapping("/my-groups")
    @Operation(summary = "Get groups the current user belongs to")
    public ResponseEntity<ApiResponse<PagedResponse<GroupDto>>> getUserGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getUserGroups(page, size)));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get list of group members with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<GroupMemberDto>>> getGroupMembers(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getGroupMembers(id, page, size)));
    }
}
