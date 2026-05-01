package com.tracker.expenses.money.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai.xai")
public class AiConfigurationProperties {
    private String apiKey;
    private String model = "grok-4-fast-non-reasoning";
    private String responsesUrl = "https://api.x.ai/v1/responses";
    private int maxOutputTokens = 220;
    private int maxExpenses = 40;
}
