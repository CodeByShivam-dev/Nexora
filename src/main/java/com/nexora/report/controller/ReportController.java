package com.nexora.report.controller;

import com.nexora.common.dto.ApiResponse;
import com.nexora.common.dto.PagedResponse;
import com.nexora.report.dto.CreateReportRequest;
import com.nexora.report.dto.ReportDto;
import com.nexora.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Moderation", description = "Community safety reporting and administrative moderation")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Submit a moderation report against a post, comment, user, or group")
    public ResponseEntity<ApiResponse<Void>> submitReport(@Valid @RequestBody CreateReportRequest request) {
        reportService.submitReport(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(null, "Report submitted for administrator review"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending reports list (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<ReportDto>>> getPendingReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getPendingReports(page, size)));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve or dismiss a report (Admin only)")
    public ResponseEntity<ApiResponse<Void>> resolveReport(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean approved
    ) {
        reportService.resolveReport(id, approved);
        return ResponseEntity.ok(ApiResponse.ok(null, "Report status updated"));
    }
}
