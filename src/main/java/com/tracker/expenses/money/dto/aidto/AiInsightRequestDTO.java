package com.tracker.expenses.money.dto.aidto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiInsightRequestDTO {
    @NotBlank(message = "Prompt is required")
    @Size(max = 500, message = "Prompt must be 500 characters or less")
    private String prompt;
}
