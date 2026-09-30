package com.nexora.page.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePageRequest {

    @NotBlank(message = "Page name cannot be blank")
    @Size(min = 2, max = 100, message = "Page name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 50, message = "Category cannot exceed 50 characters")
    private String category;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    private String avatarUrl;
    private String coverUrl;
}
