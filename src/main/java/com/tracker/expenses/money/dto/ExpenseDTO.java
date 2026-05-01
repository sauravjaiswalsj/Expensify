package com.tracker.expenses.money.dto;

import com.tracker.expenses.money.enums.Currency;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Schema(description = "Expense Data Transfer Object")
public class ExpenseDTO {
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Schema(description = "Amount of the expense", example = "100.50")
    private BigDecimal amount;

    @Schema(description = "Description of the expense", example = "Food")
    private String description;

    @Schema(description = "Category of the expense", example = "Food")
    private String category;

    @Schema(description = "Payment Type of the expense", example = "Cash")
    private String paymentType;

    @Schema(description = "Currency of the expense", example = "INR")
    private Currency currency;

    @Schema(description = "Date of the expense", example = "2022-01-01")
    private Date date;
}
