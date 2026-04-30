package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class DeleteExpense {
    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private Authentication authentication;

    @DeleteMapping("/remove")
     public ResponseEntity<ApiResponse<Expense>> deleteExpense(@RequestBody Expense expense) {
        if (!authentication.auth()){
            return ResponseEntity.status(401).body(ApiResponses.error("User Not Authenticated", "UNAUTHENTICATED"));
        }

        String authenticatedUsername = authentication.getCurrentUserName();
        if (authenticatedUsername == null || authenticatedUsername.isBlank()) {
            return ResponseEntity.status(401).body(ApiResponses.error("Unable to resolve authenticated user", "UNAUTHENTICATED"));
        }

        var response = expenseService.deleteExpense(expense, authenticatedUsername);
        ResponseHeader header = response.getHeader();
        if (header.getHttpResponseStatus().is2xxSuccessful()) {
            log.info("AUDIT expense.delete.success username={} expenseId={} correlationId={}",
                    authenticatedUsername, expense.get_id(), ApiResponses.correlationId());
            return ResponseEntity.status(header.getHttpResponseStatus().value())
                    .body(ApiResponses.success(header.getResponseMessage(), response.getMethodBody()));
        }
        return ResponseEntity.status(header.getHttpResponseStatus().value())
                .body(ApiResponses.error(header.getResponseMessage(), "EXPENSE_DELETE_FAILED"));
    }
}
