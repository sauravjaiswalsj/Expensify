package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UpdateExpense {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private Authentication authentication;

    @PutMapping("/update")
    public ResponseEntity<?> updateExpense(@RequestBody Expense expense) {
        if (!authentication.auth()) {
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));
        }
        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        var response = expenseService.updateExpense(expense, authenticatedUsername);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        return ResponseEntity.status(code).body(response);
    }
}
