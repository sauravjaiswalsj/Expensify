package com.tracker.expenses.money.controller.expense;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GetUserExpenses {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private Authentication authentication;

    @GetMapping("/expenses")
    public ResponseEntity<?> getExpenses() {
        String username = authentication.getCurrentUserName();

        if (username == null) {
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));
        }
        var response = expenseService.getExpenseByUserId(username);

        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        return ResponseEntity.status(code).body(response);
    }
}
