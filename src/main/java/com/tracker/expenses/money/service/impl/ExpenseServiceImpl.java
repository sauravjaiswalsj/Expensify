package com.tracker.expenses.money.service.impl;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.dto.responsedto.ExpenseSummaryDTO;
import com.tracker.expenses.money.exception.InvalidExpenseException;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.repository.ExpenseRepository;
import com.tracker.expenses.money.service.ExpenseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import static com.tracker.expenses.money.common.GetCurrentTime.convertLocalDateTimeToDate;

@Slf4j
@Service
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;

    @Autowired
    public ExpenseServiceImpl(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Override
    @Transactional
    public Response<ResponseHeader, Expense> addExpense(Expense expense){
        try{
            if (expense.getUsername() == null || expense.getUsername().isBlank()) {
                throw new InvalidExpenseException("Username is required");
            }
            expense.setUsername(expense.getUsername().trim().toLowerCase(Locale.ROOT));
            if (expense.getDate() == null) {
                expense.setDate(convertLocalDateTimeToDate());
            }
            expense.setCreatedAt(convertLocalDateTimeToDate());
            expense.setUpdatedAt(convertLocalDateTimeToDate());

            Expense exp = expenseRepository.save(expense);
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
            if (userId == null || userId.isBlank()) {
                throw new InvalidExpenseException("Username is required");
            }
            String username = userId.trim().toLowerCase(Locale.ROOT);
            List<Expense> expenseList = expenseRepository.findByUsername(username);

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

    @Override
    @Transactional(readOnly = true)
    public Response<ResponseHeader, ExpenseSummaryDTO> getExpenseSummaryByUserId(String userId) {
        try {
            if (userId == null || userId.isBlank()) {
                throw new InvalidExpenseException("Username is required");
            }

            String username = userId.trim().toLowerCase(Locale.ROOT);
            List<Expense> expenses = expenseRepository.findByUsername(username);
            LocalDate currentMonth = LocalDate.now(ZoneId.systemDefault()).withDayOfMonth(1);

            double totalSpend = expenses.stream()
                    .mapToDouble(Expense::getAmount)
                    .sum();
            double monthlySpend = expenses.stream()
                    .filter(expense -> isInCurrentMonth(expense, currentMonth))
                    .mapToDouble(Expense::getAmount)
                    .sum();
            long categoryCount = expenses.stream()
                    .map(Expense::getCategory)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(category -> !category.isBlank())
                    .map(category -> category.toLowerCase(Locale.ROOT))
                    .distinct()
                    .count();

            ExpenseSummaryDTO summary = new ExpenseSummaryDTO(
                    totalSpend,
                    monthlySpend,
                    categoryCount,
                    expenses.size()
            );

            return new Response<>(new ResponseHeader(HttpStatus.OK, "Expense summary retrieved successfully"), summary);
        } catch (InvalidExpenseException e) {
            log.warn("Error retrieving expense summary: {}", e.getMessage());
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, e.getMessage()), null);
        } catch (Exception ex) {
            log.error("Unexpected error retrieving expense summary", ex);
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), null);
        }
    }

    private boolean isInCurrentMonth(Expense expense, LocalDate currentMonth) {
        Date expenseDate = expense.getDate() != null ? expense.getDate() : expense.getCreatedAt();
        if (expenseDate == null) {
            return false;
        }

        LocalDate expenseMonth = expenseDate
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
                .withDayOfMonth(1);

        return currentMonth.equals(expenseMonth);
    }

    @Override
    @Transactional
    public Response<ResponseHeader, Expense> deleteExpense(Expense expense, String username) {
        try {
            if (expense == null || expense.get_id() == null || expense.get_id().isBlank()) {
                throw new InvalidExpenseException("Expense id is required");
            }
            if (username == null || username.isBlank()) {
                throw new InvalidExpenseException("Username is required");
            }

            String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);
            long deletedCount = expenseRepository.deleteByIdAndUsername(expense.get_id(), normalizedUsername);

            if (deletedCount == 0) {
                throw new InvalidExpenseException("Expense not found for user");
            }

            log.info("Deleted expense {} for user: {}", expense.get_id(), normalizedUsername);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "Expense deleted successfully"), expense);
        } catch (InvalidExpenseException e) {
            log.warn("Error deleting expense: {}", e.getMessage());
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, e.getMessage()), expense);
        } catch (Exception ex) {
            log.error("Unexpected error deleting expense", ex);
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), expense);
        }
    }

    @Override
    @Transactional
    public Response<ResponseHeader, Expense> updateExpense(Expense expense, String username) {
        try {
            if (expense == null || expense.get_id() == null || expense.get_id().isBlank()) {
                throw new InvalidExpenseException("Expense id is required");
            }
            if (username == null || username.isBlank()) {
                throw new InvalidExpenseException("Username is required");
            }
            if (expense.getAmount() <= 0) {
                throw new InvalidExpenseException("Expense amount is invalid");
            }

            String normalizedUsername = username.trim().toLowerCase(Locale.ROOT);
            Expense existingExpense = expenseRepository
                    .findByIdAndUsername(expense.get_id(), normalizedUsername)
                    .orElseThrow(() -> new InvalidExpenseException("Expense not found for user"));

            existingExpense.setAmount(expense.getAmount());
            existingExpense.setCategory(expense.getCategory());
            existingExpense.setDescription(expense.getDescription());
            existingExpense.setPaymentType(expense.getPaymentType());
            existingExpense.setCurrency(expense.getCurrency());
            existingExpense.setDate(expense.getDate());
            existingExpense.setUpdatedAt(convertLocalDateTimeToDate());

            Expense updatedExpense = expenseRepository.save(existingExpense);
            log.info("Updated expense {} for user: {}", updatedExpense.get_id(), normalizedUsername);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "Expense updated successfully"), updatedExpense);
        }
        catch (InvalidExpenseException e){
            log.warn("Error updating expense: {}", e.getMessage());
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, e.getMessage()), expense);
        } catch (Exception ex) {
            log.error("Unexpected error updating expense", ex);
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), expense);
        }
    }

}
