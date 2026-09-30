package com.nexora.report.dto;

import com.nexora.report.entity.Report;
import com.nexora.report.entity.ReportReason;
import com.nexora.report.entity.ReportStatus;
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
public class ReportDto {
    private Long id;
    private UserSummaryDto reporter;
    private String targetType;
    private Long targetId;
    private ReportReason reason;
    private String details;
    private ReportStatus status;
    private Instant createdAt;
    private Instant resolvedAt;

    public static ReportDto from(Report report) {
        return ReportDto.builder()
                .id(report.getId())
                .reporter(UserSummaryDto.from(report.getReporter()))
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .details(report.getDetails())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .build();
    }
}
