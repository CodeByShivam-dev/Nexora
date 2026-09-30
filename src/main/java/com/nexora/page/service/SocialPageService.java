package com.nexora.page.service;

import com.nexora.common.dto.PagedResponse;
import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.page.dto.CreatePageRequest;
import com.nexora.page.dto.PageDto;
import com.nexora.page.entity.PageFollower;
import com.nexora.page.entity.SocialPage;
import com.nexora.page.repository.PageFollowerRepository;
import com.nexora.page.repository.SocialPageRepository;
import com.nexora.security.SecurityUtils;
import com.nexora.user.entity.User;
import com.nexora.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SocialPageService {

    private final SocialPageRepository pageRepository;
    private final PageFollowerRepository followerRepository;
    private final UserRepository userRepository;

    @Transactional
    public PageDto createPage(CreatePageRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SocialPage page = SocialPage.builder()
                .name(request.getName().trim())
                .category(request.getCategory().trim())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .coverUrl(request.getCoverUrl())
                .owner(owner)
                .followersCount(1)
                .build();

        page = pageRepository.save(page);

        // Auto follow created page
        PageFollower follower = PageFollower.builder().page(page).user(owner).build();
        followerRepository.save(follower);

        return PageDto.from(page, true);
    }

    @Transactional
    public void followPage(Long pageId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        SocialPage page = pageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with ID " + pageId));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!followerRepository.existsByPageIdAndUserId(pageId, currentUserId)) {
            PageFollower follower = PageFollower.builder().page(page).user(user).build();
            followerRepository.save(follower);

            page.setFollowersCount((int) followerRepository.countByPage(page));
            pageRepository.save(page);
        }
    }

    @Transactional
    public void unfollowPage(Long pageId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        SocialPage page = pageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with ID " + pageId));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        followerRepository.findByPageAndUser(page, user).ifPresent(f -> {
            followerRepository.delete(f);
            page.setFollowersCount((int) followerRepository.countByPage(page));
            pageRepository.save(page);
        });
    }

    @Transactional(readOnly = true)
    public PagedResponse<PageDto> getDiscoverPages(int page, int size) {
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<SocialPage> pages = pageRepository.findAll(pageable);
        Long currentUserId = SecurityUtils.isAuthenticated() ? SecurityUtils.getCurrentUserId() : null;

        Page<PageDto> dtoPage = pages.map(p -> {
            boolean isFollowed = currentUserId != null && followerRepository.existsByPageIdAndUserId(p.getId(), currentUserId);
            return PageDto.from(p, isFollowed);
        });

        return PagedResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PageDto> getFollowedPages(int page, int size) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        int safeSize = Math.min(Math.max(1, size), 50);
        Pageable pageable = PageRequest.of(Math.max(0, page), safeSize);

        Page<SocialPage> pages = pageRepository.findFollowedPages(currentUserId, pageable);
        return PagedResponse.from(pages.map(p -> PageDto.from(p, true)));
    }
}
