package com.nexora.page.repository;

import com.nexora.page.entity.PageFollower;
import com.nexora.page.entity.SocialPage;
import com.nexora.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageFollowerRepository extends JpaRepository<PageFollower, Long> {

    boolean existsByPageIdAndUserId(Long pageId, Long userId);

    Optional<PageFollower> findByPageAndUser(SocialPage page, User user);

    void deleteByPageAndUser(SocialPage page, User user);

    long countByPage(SocialPage page);
}
