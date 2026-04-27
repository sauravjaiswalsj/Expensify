package com.tracker.expenses.money.service.impl;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.exception.InvalidExpenseException;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.ExpenseRepository;
import com.tracker.expenses.money.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.tracker.expenses.money.common.GetCurrentTime.convertLocalDateTimeToDate;

@Slf4j
@Service
public class ExpenseServiceImpl implements ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;


    @Autowired
    private UserServiceImpl userService;

    @Override
    @Transactional
    public Response<ResponseHeader, Expense> addExpense(Expense expense){
        try{
            User user = userService.findByUsername(expense.getUsername());
            if (expense.getDate() == null) {
                expense.setDate(convertLocalDateTimeToDate());
            }
            expense.setCreatedAt(convertLocalDateTimeToDate());
            expense.setUpdatedAt(convertLocalDateTimeToDate());

            Expense exp = expenseRepository.save(expense);
            user.getExpenses().add(exp);
            userService.updateUser(user);
            return new Response<>(new ResponseHeader(HttpStatus.CREATED, "Expense added successfully"), exp);
        }catch (InvalidExpenseException e){
            return new Response<>(new ResponseHeader(HttpStatus.CONFLICT, e.getMessage()), expense);
        } catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), expense);
        }
    }

    @Override
    @Transactional (readOnly = true)
    public Response<ResponseHeader, List<Expense>> getExpenseByUserId(String userId) {
        try {
            log.info("Getting expenses for user: {}", userId);
            String username = userId.toLowerCase();
            
            // Verify user exists
            User user = userService.findByUsername(username);
            if (user == null) {
                throw new InvalidExpenseException("User not found: " + userId);
            }
            
            // Fetch expenses by username
            List<Expense> expenseList = expenseRepository.findByUsername(username);

            if (expenseList.isEmpty()) {
                throw new InvalidExpenseException("No expenses found for user " + user.getFirstName() + " " + user.getLastName());
            }

            log.info("Found {} expenses for user: {}", expenseList.size(), username);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "Expenses retrieved successfully"), expenseList);
        }catch (InvalidExpenseException e){
            log.warn("Error retrieving expenses: {}", e.getMessage());
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, e.getMessage()), null);
        }
        catch (Exception ex){
            log.error("Unexpected error retrieving expenses", ex);
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), null);
        }
    }

}
