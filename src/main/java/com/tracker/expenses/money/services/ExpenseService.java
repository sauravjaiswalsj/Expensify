package com.tracker.expenses.money.services;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.model.Expense;
import org.springframework.stereotype.Service;

@Service
public interface ExpenseService {
    Response<ResponseHeader, Expense> addExpense(Expense Expense);
}
