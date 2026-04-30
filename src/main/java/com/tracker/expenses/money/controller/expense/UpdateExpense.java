package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class UpdateExpense {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private Authentication authentication;

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<Expense>> updateExpense(@RequestBody Expense expense) {
        if (!authentication.auth()) {
            return ResponseEntity.status(401).body(ApiResponses.error("User Not Authenticated", "UNAUTHENTICATED"));
        }
        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponses.error("Unable to resolve authenticated user", "UNAUTHENTICATED"));
        }
        var response = expenseService.updateExpense(expense, authenticatedUsername);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        if (httpResponseStatus.is2xxSuccessful()) {
            log.info("AUDIT expense.update.success username={} expenseId={} correlationId={}",
                    authenticatedUsername, response.getMethodBody().get_id(), ApiResponses.correlationId());
            return ResponseEntity.status(code)
                    .body(ApiResponses.success(response.getHeader().getResponseMessage(), response.getMethodBody()));
        }
        return ResponseEntity.status(code)
                .body(ApiResponses.error(response.getHeader().getResponseMessage(), "EXPENSE_UPDATE_FAILED"));
    }
}
