package com.nexora.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${nexora.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${nexora.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${nexora.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${nexora.cors.max-age-secs:3600}")
    private long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.stream(allowedMethods.split(",")).map(String::trim).toList());
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Retry-After"));
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
