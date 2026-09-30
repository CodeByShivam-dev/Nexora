package com.nexora.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {

    // Aggregated platform metrics used by the admin dashboard.
    private long totalUsers;
    private long activeUsers;
    private long totalPosts;
    private long totalComments;
    private long totalGroups;
    private long pendingReports;
}