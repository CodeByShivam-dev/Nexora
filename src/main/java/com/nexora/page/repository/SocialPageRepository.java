package com.nexora.page.repository;

import com.nexora.page.entity.SocialPage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialPageRepository extends JpaRepository<SocialPage, Long> {

    @Query("SELECT p FROM SocialPage p JOIN PageFollower pf ON pf.page = p WHERE pf.user.id = :userId")
    Page<SocialPage> findFollowedPages(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM SocialPage p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<SocialPage> searchPages(@Param("query") String query, Pageable pageable);

    List<SocialPage> findTop5ByOrderByFollowersCountDesc();
}
