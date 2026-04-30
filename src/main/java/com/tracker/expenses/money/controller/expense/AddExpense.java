package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class AddExpense {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private Authentication authentication;
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Expense>> addExpense(@RequestBody Expense expense) {
        if (!authentication.auth()){
            return ResponseEntity.status(401).body(ApiResponses.error("User Not Authenticated", "UNAUTHENTICATED"));
        }
        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(401).body(ApiResponses.error("Unable to resolve authenticated user", "UNAUTHENTICATED"));
        }
        if (expense == null) {
            return ResponseEntity.status(400).body(ApiResponses.error("Expense is empty", "INVALID_EXPENSE"));
        }
        if (expense.getAmount() <= 0) {
            return ResponseEntity.status(400).body(ApiResponses.error("Expense amount is invalid", "INVALID_EXPENSE"));
        }
        expense.setUsername(authenticatedUsername.toLowerCase());
        var response = expenseService.addExpense(expense);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        if (httpResponseStatus.is2xxSuccessful()) {
            log.info("AUDIT expense.create.success username={} expenseId={} amount={} correlationId={}",
                    authenticatedUsername, response.getMethodBody().get_id(), response.getMethodBody().getAmount(), ApiResponses.correlationId());
            return ResponseEntity.status(code)
                    .body(ApiResponses.success(response.getHeader().getResponseMessage(), response.getMethodBody()));
        }
        return ResponseEntity.status(code)
                .body(ApiResponses.error(response.getHeader().getResponseMessage(), "EXPENSE_CREATE_FAILED"));
    }
}
