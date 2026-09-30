package com.nexora.auth.repository;

import com.nexora.auth.entity.OtpPurpose;
import com.nexora.auth.entity.OtpVerification;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByUserAndPurposeAndUsedAtIsNullOrderByCreatedAtDesc(User user, OtpPurpose purpose);

    @Modifying
    @Query("UPDATE OtpVerification o SET o.usedAt = CURRENT_TIMESTAMP WHERE o.user = :user AND o.purpose = :purpose AND o.usedAt IS NULL")
    void invalidatePreviousOtps(@Param("user") User user, @Param("purpose") OtpPurpose purpose);
}
