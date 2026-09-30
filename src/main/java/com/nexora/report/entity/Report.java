package com.nexora.report.entity;

import com.nexora.common.entity.BaseEntity;
import com.nexora.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "reports", uniqueConstraints = {
        @UniqueConstraint(name = "uq_report_target_reporter", columnNames = {"reporter_id", "target_type", "target_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // POST, COMMENT, USER, GROUP

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 50)
    private ReportReason reason;

    @Column(name = "details", length = 1000)
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;
}
