package com.nexora.hashtag.service;

import com.nexora.common.exception.ResourceNotFoundException;
import com.nexora.hashtag.dto.HashtagDto;
import com.nexora.hashtag.entity.Hashtag;
import com.nexora.hashtag.entity.PostHashtag;
import com.nexora.hashtag.repository.HashtagRepository;
import com.nexora.hashtag.repository.PostHashtagRepository;
import com.nexora.post.entity.Post;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class HashtagService {

    private static final Logger log = LoggerFactory.getLogger(HashtagService.class);
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#([a-zA-Z0-9_]+)");
    private static final String TRENDING_CACHE_KEY = "nexora:hashtags:trending";

    private final HashtagRepository hashtagRepository;
    private final PostHashtagRepository postHashtagRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public void processHashtagsForPost(Post post, String content) {
        if (content == null || content.isBlank()) return;

        Set<String> extractedNames = extractHashtags(content);
        for (String name : extractedNames) {
            Hashtag hashtag = hashtagRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> hashtagRepository.save(
                            Hashtag.builder().name(name).postsCount(0).build()
                    ));

            hashtag.setPostsCount(hashtag.getPostsCount() + 1);
            hashtagRepository.save(hashtag);

            PostHashtag mapping = PostHashtag.builder()
                    .post(post)
                    .hashtag(hashtag)
                    .build();
            postHashtagRepository.save(mapping);
        }
    }

    public Set<String> extractHashtags(String content) {
        Set<String> tags = new HashSet<>();
        Matcher matcher = HASHTAG_PATTERN.matcher(content);
        while (matcher.find()) {
            String tag = matcher.group(1).trim().toLowerCase();
            if (tag.length() >= 2 && tag.length() <= 50) {
                tags.add(tag);
            }
        }
        return tags;
    }

    @Transactional(readOnly = true)
    public HashtagDto getHashtag(String name) {
        Hashtag hashtag = hashtagRepository.findByNameIgnoreCase(name.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Hashtag #" + name + " not found"));
        return HashtagDto.from(hashtag);
    }

    @Transactional(readOnly = true)
    public List<HashtagDto> getTrendingHashtags(int limit) {
        int safeLimit = Math.min(Math.max(1, limit), 20);

        try {
            Object cached = redisTemplate.opsForValue().get(TRENDING_CACHE_KEY);
            if (cached instanceof List<?> list && !list.isEmpty()) {
                return ((List<?>) list).stream()
                        .filter(item -> item instanceof HashtagDto)
                        .map(item -> (HashtagDto) item)
                        .toList();
            }
        } catch (Exception e) {
            log.debug("Redis cache read failed for trending hashtags: {}", e.getMessage());
        }

        List<HashtagDto> results = hashtagRepository.findTopTrending(PageRequest.of(0, safeLimit))
                .stream().map(HashtagDto::from).toList();

        try {
            redisTemplate.opsForValue().set(TRENDING_CACHE_KEY, results, Duration.ofMinutes(10));
        } catch (Exception e) {
            log.debug("Redis cache write failed: {}", e.getMessage());
        }

        return results;
    }
}
