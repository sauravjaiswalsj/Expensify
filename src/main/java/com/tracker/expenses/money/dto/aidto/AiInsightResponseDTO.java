package com.tracker.expenses.money.dto.aidto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiInsightResponseDTO {
    private String reply;
    private boolean aiGenerated;
}
