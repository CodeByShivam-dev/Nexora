package com.nexora.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "nexora.rate-limit")
public class RateLimitConfig {
    private boolean enabled = true;
    private int loginLimitPerMinute = 5;
    private int otpLimitPerTenMinutes = 3;
    private int otpMaxVerifyAttempts = 5;
    private int postLimitPerMinute = 20;
    private int commentLimitPerMinute = 30;
    private int messageLimitPerMinute = 30;
    private int followLimitPerMinute = 50;
    private int searchLimitPerMinute = 60;
    private int generalLimitPerMinute = 100;
}
