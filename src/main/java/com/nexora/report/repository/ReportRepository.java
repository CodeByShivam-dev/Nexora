package com.nexora.report.repository;

import com.nexora.report.entity.Report;
import com.nexora.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    boolean existsByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
}
