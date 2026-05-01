package com.tracker.expenses.money.dto.responsedto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ExpenseSummaryDTO {
    private BigDecimal totalSpend;
    private BigDecimal monthlySpend;
    private long categoryCount;
    private long transactionCount;
}
