package com.tracker.expenses.money.service;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.model.Expense;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ExpenseService {
    Response<ResponseHeader, Expense> addExpense(Expense Expense);
//    Response<ResponseHeader, Expense> updateExpense(Expense Expense);
//    Response<ResponseHeader, Expense> deleteExpense(String id);
//    Response<ResponseHeader, Expense> getExpenseById(String id);
    Response<ResponseHeader, List<Expense>> getExpenseByUserId(String userId);
}
