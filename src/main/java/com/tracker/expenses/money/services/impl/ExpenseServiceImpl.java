package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.common.GetCurrentTime;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.exception.InvalidExpense;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.ExpenseRepository;
import com.tracker.expenses.money.services.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.tracker.expenses.money.common.GetCurrentTime.convertLocalDateTimeToDate;

@Service
public class ExpenseServiceImpl implements ExpenseService {
    @Autowired
    private ExpenseRepository expenseRepository;


    @Autowired
    private UserServiceImpl userService;

    /**
     * Adds a new expense for a user and updates the user's expense list.
     *
     * If the expense date is not provided, it is set to the current date and time. The method also sets the creation and update timestamps for the expense, saves it to the database, and associates it with the user. Returns a response indicating the result of the operation, including appropriate HTTP status codes for success or error conditions.
     *
     * @param expense the expense to be added
     * @return a response containing the status and the added expense or error details
     */
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
        }catch (InvalidExpense e){
            return new Response<>(new ResponseHeader(HttpStatus.CONFLICT, e.getMessage()), expense);
        } catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), expense);
        }
    }

}
