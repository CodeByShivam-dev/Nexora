package com.nexora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class NexoraApplication
{

    public static void main(String[] args) {
        SpringApplication.run(NexoraApplication.class, args);
    }
}
