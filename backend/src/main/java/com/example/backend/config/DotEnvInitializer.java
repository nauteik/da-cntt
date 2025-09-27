package com.example.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads environment variables from .env file during application startup.
 * This ensures that .env variables are available before Spring processes application.yml
 */
public class DotEnvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        
        try {
            // Load .env file from the current directory (backend/)
            Dotenv dotenv = Dotenv.configure()
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();

            // Convert dotenv entries to a property source
            Map<String, Object> envProperties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                envProperties.put(entry.getKey(), entry.getValue());
            });

            // Add the property source to Spring's environment with high priority
            environment.getPropertySources().addFirst(
                    new MapPropertySource("dotenv", envProperties)
            );

        } catch (Exception e) {
            // Log warning but don't fail startup if .env file is not found
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
        }
    }
}