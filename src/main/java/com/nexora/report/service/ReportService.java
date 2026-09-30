package com.nexora.report.service;

import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.DuplicateResourceException;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.report.dto.CreateReportRequest;
import com.nexora.report.dto.ReportDto;
import com.nexora.report.entity.Report;
import com.nexora.report.entity.ReportStatus;
import com.nexora.report.repository.ReportRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitReport(CreateReportRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User reporter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String targetType = request.getTargetType().toUpperCase();

        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(currentUserId, targetType, request.getTargetId())) {
            throw new DuplicateResourceException("You have already reported this content for review");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(targetType)
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .details(request.getDetails())
                .status(ReportStatus.PENDING)
                .build();

        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReportDto> getPendingReports(int page, int size) {
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<Report> reportsPage = reportRepository.findByStatus(ReportStatus.PENDING, pageable);
        return PagedResponse.from(reportsPage.map(ReportDto::from));
    }

    @Transactional
    public void resolveReport(Long reportId, boolean approved) {
        Long adminId = SecurityUtils.getCurrentUserId();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(approved ? ReportStatus.RESOLVED : ReportStatus.REJECTED);
        report.setResolvedAt(Instant.now());
        report.setResolvedBy(admin);
        reportRepository.save(report);
    }
}
