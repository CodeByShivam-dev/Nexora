package com.nexora.report.dto;

import com.nexora.report.entity.ReportReason;
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
public class CreateReportRequest {

    @NotBlank(message = "Target type must be specified")
    private String targetType; // POST, COMMENT, USER, GROUP

    @NotNull(message = "Target ID must be specified")
    private Long targetId;

    @NotNull(message = "Report reason must be specified")
    private ReportReason reason;

    @Size(max = 1000, message = "Details cannot exceed 1000 characters")
    private String details;
}
