package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.responsedto.ExpenseSummaryDTO;
import com.tracker.expenses.money.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GetExpenseSummary {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private Authentication authentication;

    @GetMapping("/expenses/summary")
    public ResponseEntity<ApiResponse<ExpenseSummaryDTO>> getExpenseSummary() {
        String username = authentication.getCurrentUserName();

        if (username == null) {
            return ResponseEntity.status(401).body(ApiResponses.error("User Not Authenticated", "UNAUTHENTICATED"));
        }

        var response = expenseService.getExpenseSummaryByUserId(username);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        if (httpResponseStatus.is2xxSuccessful()) {
            return ResponseEntity.status(code)
                    .body(ApiResponses.success(response.getHeader().getResponseMessage(), response.getMethodBody()));
        }
        return ResponseEntity.status(code)
                .body(ApiResponses.error(response.getHeader().getResponseMessage(), "EXPENSE_SUMMARY_FAILED"));
    }
}
