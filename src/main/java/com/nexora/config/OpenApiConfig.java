package com.nexora.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI nexoraOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NEXORA REST API")
                        .description("High-performance social networking backend for NEXORA. Connect. Share. Discover.")
                        .version("1.0.0")
                        .contact(new Contact().name("NEXORA Engineering Team").email("engineering@nexora.io"))
                        .license(new License().name("Apache 2.0")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder().group("1-auth").pathsToMatch("/api/auth/**").build();
    }

    @Bean
    public GroupedOpenApi usersApi() {
        return GroupedOpenApi.builder().group("2-users").pathsToMatch("/api/users/**").build();
    }

    @Bean
    public GroupedOpenApi postsApi() {
        return GroupedOpenApi.builder().group("3-posts-and-feed").pathsToMatch("/api/posts/**", "/api/feed/**").build();
    }

    @Bean
    public GroupedOpenApi commentsApi() {
        return GroupedOpenApi.builder().group("4-comments").pathsToMatch("/api/comments/**").build();
    }

    @Bean
    public GroupedOpenApi socialApi() {
        return GroupedOpenApi.builder().group("5-social").pathsToMatch("/api/follow-requests/**", "/api/hashtags/**", "/api/search/**").build();
    }

    @Bean
    public GroupedOpenApi messagesApi() {
        return GroupedOpenApi.builder().group("6-messages").pathsToMatch("/api/messages/**", "/api/conversations/**").build();
    }

    @Bean
    public GroupedOpenApi groupsAndPagesApi() {
        return GroupedOpenApi.builder().group("7-groups-and-pages").pathsToMatch("/api/groups/**", "/api/pages/**").build();
    }

    @Bean
    public GroupedOpenApi notificationsApi() {
        return GroupedOpenApi.builder().group("8-notifications").pathsToMatch("/api/notifications/**").build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder().group("9-admin").pathsToMatch("/api/admin/**", "/api/reports/**").build();
    }
}
