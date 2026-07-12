package com.laikaclub.stats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class StatsApplication {
    public static void main(String[] args) {
        SpringApplication.run(StatsApplication.class, args);
    }
}
