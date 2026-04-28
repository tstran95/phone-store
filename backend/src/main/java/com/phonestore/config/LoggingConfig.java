package com.phonestore.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
@Slf4j
public class LoggingConfig {

    @PostConstruct
    public void init() {
        // Create logs directory if not exists
        File logDir = new File("./logs");
        if (!logDir.exists()) {
            boolean created = logDir.mkdirs();
            if (created) {
                log.info("Created logs directory: {}", logDir.getAbsolutePath());
            }
        }

        log.info("========================================");
        log.info("Logging system initialized");
        log.info("Log files location: {}", logDir.getAbsolutePath());
        log.info("Trace token enabled for request tracking");
        log.info("========================================");
    }
}
