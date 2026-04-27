package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeleteExpense {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private Authentication authentication;

    @DeleteMapping("/remove")
     public ResponseEntity<?> deleteExpense(@RequestBody Expense expense) {
        if (!authentication.auth()){
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));
        }

        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(401).body(new Response(false, "Unable to resolve authenticated user"));
        }

        var response = expenseService.deleteExpense(expense, authenticatedUsername);
        ResponseHeader header = response.getHeader();
        return ResponseEntity.status(header.getHttpResponseStatus().value()).body(response);
    }
}
