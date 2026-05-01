package com.tracker.expenses.money.service;

import com.tracker.expenses.money.dto.aidto.AiInsightResponseDTO;

public interface AiInsightService {
    AiInsightResponseDTO getInsight(String username, String prompt);
}
