package com.nexora.security;

import com.nexora.common.exception.RateLimitException;
import com.nexora.config.RateLimitConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final RateLimitConfig rateLimitConfig;

    // In-memory fallback map for environments or transient situations where Redis is offline
    private final Map<String, InMemoryCounter> fallbackCache = new ConcurrentHashMap<>();

    private static class InMemoryCounter {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long resetTime = System.currentTimeMillis() + 60_000;
    }

    public void checkRateLimit(String key, int maxAllowed, Duration window) {
        if (!rateLimitConfig.isEnabled()) {
            return;
        }

        try {
            Long current = redisTemplate.opsForValue().increment(key);
            if (current != null && current == 1) {
                redisTemplate.expire(key, window);
            }

            if (current != null && current > maxAllowed) {
                log.warn("Rate limit exceeded for key '{}' ({} > {})", key, current, maxAllowed);
                throw new RateLimitException("Too many requests. Please slow down and try again.", window.toSeconds());
            }
        } catch (RateLimitException rle) {
            throw rle;
        } catch (Exception e) {
            log.debug("Redis rate limiting unavailable, applying local in-memory rate limiting: {}", e.getMessage());
            checkInMemoryFallback(key, maxAllowed, window);
        }
    }

    private void checkInMemoryFallback(String key, int maxAllowed, Duration window) {
        long now = System.currentTimeMillis();
        InMemoryCounter counter = fallbackCache.compute(key, (k, existing) -> {
            if (existing == null || now > existing.resetTime) {
                InMemoryCounter fresh = new InMemoryCounter();
                fresh.count.set(1);
                fresh.resetTime = now + window.toMillis();
                return fresh;
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (counter.count.get() > maxAllowed) {
            long retrySeconds = Math.max(1, (counter.resetTime - now) / 1000);
            throw new RateLimitException("Rate limit exceeded. Please wait.", retrySeconds);
        }
    }

    public void checkLoginRateLimit(String ipOrUsername) {
        checkRateLimit("rate:login:" + ipOrUsername.toLowerCase(), rateLimitConfig.getLoginLimitPerMinute(), Duration.ofMinutes(1));
    }

    public void checkOtpRequestRateLimit(String emailOrPhone) {
        checkRateLimit("rate:otp:request:" + emailOrPhone.toLowerCase(), rateLimitConfig.getOtpLimitPerTenMinutes(), Duration.ofMinutes(10));
    }

    public void checkOtpVerifyRateLimit(String emailOrPhone) {
        checkRateLimit("rate:otp:verify:" + emailOrPhone.toLowerCase(), rateLimitConfig.getOtpMaxVerifyAttempts(), Duration.ofMinutes(10));
    }

    public void checkPostCreationLimit(Long userId) {
        checkRateLimit("rate:post:" + userId, rateLimitConfig.getPostLimitPerMinute(), Duration.ofMinutes(1));
    }

    public void checkCommentLimit(Long userId) {
        checkRateLimit("rate:comment:" + userId, rateLimitConfig.getCommentLimitPerMinute(), Duration.ofMinutes(1));
    }

    public void checkMessageLimit(Long userId) {
        checkRateLimit("rate:message:" + userId, rateLimitConfig.getMessageLimitPerMinute(), Duration.ofMinutes(1));
    }

    public void checkFollowLimit(Long userId) {
        checkRateLimit("rate:follow:" + userId, rateLimitConfig.getFollowLimitPerMinute(), Duration.ofMinutes(1));
    }

    public void checkSearchLimit(Long userIdOrIp) {
        checkRateLimit("rate:search:" + userIdOrIp, rateLimitConfig.getSearchLimitPerMinute(), Duration.ofMinutes(1));
    }
}
