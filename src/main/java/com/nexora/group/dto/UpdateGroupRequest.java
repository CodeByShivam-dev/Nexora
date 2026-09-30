package com.nexora.group.dto;

import com.nexora.group.entity.GroupPrivacy;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupRequest {

    @Size(min = 3, max = 100, message = "Group name must be between 3 and 100 characters")
    private String name;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String avatarUrl;
    private String coverUrl;
    private GroupPrivacy privacy;
}
