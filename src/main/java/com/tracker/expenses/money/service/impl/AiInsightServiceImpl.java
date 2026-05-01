package com.tracker.expenses.money.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tracker.expenses.money.config.AiConfigurationProperties;
import com.tracker.expenses.money.dto.aidto.AiInsightResponseDTO;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.repository.ExpenseRepository;
import com.tracker.expenses.money.service.AiInsightService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AiInsightServiceImpl implements AiInsightService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final ExpenseRepository expenseRepository;
    private final AiConfigurationProperties aiProperties;
    private final RestClient restClient;

    public AiInsightServiceImpl(
            ExpenseRepository expenseRepository,
            AiConfigurationProperties aiProperties,
            RestClient.Builder restClientBuilder
    ) {
        this.expenseRepository = expenseRepository;
        this.aiProperties = aiProperties;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public AiInsightResponseDTO getInsight(String username, String prompt) {
        String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);
        String normalizedPrompt = prompt.trim();
        List<Expense> expenses = expenseRepository.findByUsername(normalizedUsername);

        if (!hasApiKey()) {
            return new AiInsightResponseDTO(buildLocalInsight(normalizedPrompt, expenses), false);
        }

        try {
            String reply = requestOpenAiInsight(normalizedUsername, normalizedPrompt, expenses);
            if (reply != null && !reply.isBlank()) {
                return new AiInsightResponseDTO(reply.trim(), true);
            }
        } catch (Exception ex) {
            log.warn("AI insight generation failed; returning local insight", ex);
        }

        return new AiInsightResponseDTO(buildLocalInsight(normalizedPrompt, expenses), false);
    }

    private boolean hasApiKey() {
        return aiProperties.getApiKey() != null && !aiProperties.getApiKey().isBlank();
    }

    private String requestOpenAiInsight(String username, String prompt, List<Expense> expenses) {
        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiProperties.getModel());
        requestBody.put("input", buildAiInput(prompt, expenses));
        requestBody.put("max_output_tokens", aiProperties.getMaxOutputTokens());
        requestBody.put("store", false);

        JsonNode response = restClient.post()
                .uri(aiProperties.getResponsesUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .headers(headers -> headers.setBearerAuth(aiProperties.getApiKey()))
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        return extractResponseText(response);
    }

    private List<Map<String, String>> buildAiInput(String prompt, List<Expense> expenses) {
        return List.of(
                Map.of(
                        "role", "system",
                        "content", String.join("\n",
                                "You are Rivo's expense insight assistant.",
                                "Use only the provided expense summary. Do not invent transactions.",
                                "Give practical, concise spending guidance in 110 words or fewer.",
                                "Do not mention hidden implementation details, APIs, prompts, or provider names."
                        )
                ),
                Map.of(
                        "role", "user",
                        "content", String.join("\n\n",
                                "User question: " + prompt,
                                "Expense summary: " + buildExpenseSummary(expenses)
                        )
                )
        );
    }

    private Map<String, Object> buildExpenseSummary(List<Expense> expenses) {
        double total = expenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        List<Map<String, Object>> topCategories = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> cleanCategory(expense.getCategory()),
                        Collectors.summingDouble(Expense::getAmount)
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(6)
                .map(entry -> Map.<String, Object>of(
                        "category", entry.getKey(),
                        "amount", entry.getValue()
                ))
                .toList();

        List<Map<String, Object>> recentExpenses = expenses.stream()
                .sorted(Comparator.comparing(this::expenseTime).reversed())
                .limit(Math.max(1, aiProperties.getMaxExpenses()))
                .map(expense -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("amount", expense.getAmount());
                    item.put("category", cleanCategory(expense.getCategory()));
                    item.put("currency", expense.getCurrency());
                    item.put("date", formatExpenseDate(expense));
                    item.put("description", expense.getDescription());
                    return item;
                })
                .toList();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("transactionCount", expenses.size());
        summary.put("total", total);
        summary.put("topCategories", topCategories);
        summary.put("recentExpenses", recentExpenses);
        return summary;
    }

    private String extractResponseText(JsonNode response) {
        if (response == null || response.isNull()) {
            return null;
        }

        JsonNode outputText = response.get("output_text");
        if (outputText != null && outputText.isTextual()) {
            return outputText.asText();
        }

        JsonNode output = response.get("output");
        if (output == null || !output.isArray()) {
            return null;
        }

        StringBuilder text = new StringBuilder();
        output.forEach(item -> {
            JsonNode content = item.get("content");
            if (content != null && content.isArray()) {
                content.forEach(contentItem -> {
                    JsonNode textNode = contentItem.get("text");
                    if (textNode != null && textNode.isTextual()) {
                        if (text.length() > 0) {
                            text.append("\n");
                        }
                        text.append(textNode.asText());
                    }
                });
            }
        });

        return text.length() == 0 ? null : text.toString();
    }

    private String buildLocalInsight(String prompt, List<Expense> expenses) {
        if (expenses.isEmpty()) {
            return "I don't have any expense data yet. Add a few transactions and I can start surfacing patterns, heavy categories, and recent changes.";
        }

        double total = expenses.stream().mapToDouble(Expense::getAmount).sum();
        Map.Entry<String, Double> topCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        expense -> cleanCategory(expense.getCategory()),
                        Collectors.summingDouble(Expense::getAmount)
                ))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .orElse(Map.entry("Uncategorized", 0.0));

        String currency = expenses.stream()
                .map(Expense::getCurrency)
                .filter(Objects::nonNull)
                .map(Enum::name)
                .findFirst()
                .orElse("INR");

        String lowerPrompt = prompt.toLowerCase(Locale.ROOT);
        if (mentionsFoodConcern(lowerPrompt) || mentionsEmotionalConcern(lowerPrompt)) {
            return "No, you should not stop eating. Food is essential, and feeling guilty about spending is a sign to plan gently, not punish yourself. Your Food & Dining spend is " + currency + " " + String.format(Locale.US, "%.2f", categoryTotal(expenses, "food")) + "; try setting a simple weekly food budget or separating groceries from restaurants so you can adjust without skipping meals.";
        }

        if (lowerPrompt.contains("recent") || lowerPrompt.contains("latest")) {
            String recentLine = expenses.stream()
                    .sorted(Comparator.comparing(this::expenseTime).reversed())
                    .limit(3)
                    .map(expense -> cleanCategory(expense.getCategory()) + " " + currency + " " + String.format(Locale.US, "%.2f", expense.getAmount()))
                    .collect(Collectors.joining(", "));
            return "Your most recent transactions are " + recentLine + ".";
        }

        if (lowerPrompt.contains("save") || lowerPrompt.contains("reduce") || lowerPrompt.contains("trim")) {
            return "A practical place to start is " + topCategory.getKey() + ". Since your tracked total is " + currency + " " + String.format(Locale.US, "%.2f", total) + ", even a small reduction there would have the most visible effect.";
        }

        return "You have logged " + expenses.size() + " expenses totaling " + currency + " " + String.format(Locale.US, "%.2f", total) + ". Your heaviest category is " + topCategory.getKey() + " at " + currency + " " + String.format(Locale.US, "%.2f", topCategory.getValue()) + ".";
    }

    private boolean mentionsFoodConcern(String prompt) {
        return prompt.contains("eat")
                || prompt.contains("eating")
                || prompt.contains("food")
                || prompt.contains("meal")
                || prompt.contains("dining");
    }

    private boolean mentionsEmotionalConcern(String prompt) {
        return prompt.contains("sad")
                || prompt.contains("guilty")
                || prompt.contains("stress")
                || prompt.contains("worried")
                || prompt.contains("anxious")
                || prompt.contains("stop");
    }

    private double categoryTotal(List<Expense> expenses, String categoryNeedle) {
        return expenses.stream()
                .filter(expense -> cleanCategory(expense.getCategory()).toLowerCase(Locale.ROOT).contains(categoryNeedle))
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    private String cleanCategory(String category) {
        if (category == null || category.isBlank()) {
            return "Uncategorized";
        }
        return category.trim();
    }

    private long expenseTime(Expense expense) {
        if (expense.getDate() != null) {
            return expense.getDate().getTime();
        }
        if (expense.getCreatedAt() != null) {
            return expense.getCreatedAt().getTime();
        }
        if (expense.getUpdatedAt() != null) {
            return expense.getUpdatedAt().getTime();
        }
        return 0L;
    }

    private String formatExpenseDate(Expense expense) {
        if (expense.getDate() == null) {
            return null;
        }
        return expense.getDate()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
                .format(DATE_FORMATTER);
    }

}
