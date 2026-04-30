package com.tracker.expenses.money.dto.responsedto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ExpenseSummaryDTO {
    private double totalSpend;
    private double monthlySpend;
    private long categoryCount;
    private long transactionCount;
}
