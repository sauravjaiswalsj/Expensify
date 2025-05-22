package com.tracker.expenses.money.dto;

import com.tracker.expenses.money.enums.Currency;
import lombok.Data;

import java.util.Date;

@Data
public class ExpenseDTO {
    private double amount;
    private String description;
    private String category;
    private String paymentType;
    private Currency currency;
    private Date date;
}
