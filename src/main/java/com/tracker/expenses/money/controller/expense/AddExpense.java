package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AddExpense {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private Authentication authentication;
    @PostMapping("/add")
    public ResponseEntity<?> addExpense(@RequestBody Expense expense) {
        if (!authentication.auth()){
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));
        }
        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(401).body(new Response(false, "Unable to resolve authenticated user"));
        }
        if (expense == null) {
            return ResponseEntity.status(400).body(new Response(false, "Expense is empty"));
        }
        if (expense.getAmount() <= 0) {
            return ResponseEntity.status(400).body(new Response(false, "Expense amount is invalid"));
        }
        expense.setUsername(authenticatedUsername.toLowerCase());
        var response = expenseService.addExpense(expense);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        return ResponseEntity.status(code).body(response);
    }
}
