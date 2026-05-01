package com.tracker.expenses.money.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai.openai")
public class AiConfigurationProperties {
    private String apiKey;
    private String model = "gpt-5.4-mini";
    private String responsesUrl = "https://api.openai.com/v1/responses";
    private int maxOutputTokens = 220;
    private int maxExpenses = 40;
}
