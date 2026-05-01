package com.tracker.expenses.money.service.impl;

import com.tracker.expenses.money.dto.responsedto.ExpenseSummaryDTO;
import com.tracker.expenses.money.model.Expense;
import com.tracker.expenses.money.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ExpenseServiceImplTest {

    private InMemoryExpenseRepository expenseRepository;
    private ExpenseServiceImpl expenseService;

    @BeforeEach
    void setUp() {
        expenseRepository = new InMemoryExpenseRepository();
        expenseService = new ExpenseServiceImpl(expenseRepository);
    }

    @Test
    void getExpenseSummaryByUserIdCalculatesUserTotals() {
        LocalDate now = LocalDate.now(ZoneId.systemDefault());
        Expense currentMonthFood = expense(new BigDecimal("120.50"), "Food", now);
        Expense previousMonthFood = expense(new BigDecimal("30.00"), " food ", now.minusMonths(1));
        Expense currentMonthTravel = expense(new BigDecimal("45.25"), "Travel", now);
        Expense uncategorized = expense(10.00, null, null);
        uncategorized.setCreatedAt(Date.from(now.atStartOfDay(ZoneId.systemDefault()).toInstant()));

        expenseRepository.expenses = List.of(currentMonthFood, previousMonthFood, currentMonthTravel, uncategorized);

        var response = expenseService.getExpenseSummaryByUserId(" CoDeX ");
        ExpenseSummaryDTO summary = response.getMethodBody();

        assertEquals(HttpStatus.OK, response.getHeader().getHttpResponseStatus());
        assertEquals(new BigDecimal("205.75"), summary.getTotalSpend());
        assertEquals(new BigDecimal("175.75"), summary.getMonthlySpend());
        assertEquals(2, summary.getCategoryCount());
        assertEquals(4, summary.getTransactionCount());
    }

    @Test
    void getExpenseSummaryByUserIdRejectsBlankUsername() {
        var response = expenseService.getExpenseSummaryByUserId(" ");

        assertEquals(HttpStatus.BAD_REQUEST, response.getHeader().getHttpResponseStatus());
        assertEquals("Username is required", response.getHeader().getResponseMessage());
    }

    private Expense expense(double amount, String category, LocalDate date) {
        return expense(BigDecimal.valueOf(amount), category, date);
    }

    private Expense expense(BigDecimal amount, String category, LocalDate date) {
        Expense expense = new Expense();
        expense.setAmount(amount);
        expense.setCategory(category);
        if (date != null) {
            expense.setDate(Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        return expense;
    }

    private static class InMemoryExpenseRepository implements ExpenseRepository {
        private List<Expense> expenses = new ArrayList<>();

        @Override
        public List<Expense> findByUsername(String username) {
            return expenses;
        }

        @Override
        public <S extends Expense> S save(S entity) {
            expenses.add(entity);
            return entity;
        }

        @Override
        public <S extends Expense> List<S> saveAll(Iterable<S> entities) {
            throw new UnsupportedOperationException();
        }

        @Override
        public java.util.Optional<Expense> findById(String id) {
            throw new UnsupportedOperationException();
        }

        @Override
        public boolean existsById(String id) {
            throw new UnsupportedOperationException();
        }

        @Override
        public List<Expense> findAll() {
            return expenses;
        }

        @Override
        public List<Expense> findAllById(Iterable<String> strings) {
            throw new UnsupportedOperationException();
        }

        @Override
        public long count() {
            return expenses.size();
        }

        @Override
        public void deleteById(String id) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void delete(Expense entity) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void deleteAllById(Iterable<? extends String> strings) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void deleteAll(Iterable<? extends Expense> entities) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void deleteAll() {
            expenses = new ArrayList<>();
        }

        @Override
        public List<Expense> findAll(Sort sort) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Page<Expense> findAll(Pageable pageable) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> S insert(S entity) {
            return save(entity);
        }

        @Override
        public <S extends Expense> List<S> insert(Iterable<S> entities) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> java.util.Optional<S> findOne(Example<S> example) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> List<S> findAll(Example<S> example) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> List<S> findAll(Example<S> example, Sort sort) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> Page<S> findAll(Example<S> example, Pageable pageable) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> long count(Example<S> example) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense> boolean exists(Example<S> example) {
            throw new UnsupportedOperationException();
        }

        @Override
        public <S extends Expense, R> R findBy(Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
            throw new UnsupportedOperationException();
        }

        @Override
        public java.util.Optional<Expense> findByIdAndUsername(String id, String username) {
            throw new UnsupportedOperationException();
        }

        @Override
        public long deleteByIdAndUsername(String id, String username) {
            throw new UnsupportedOperationException();
        }
    }
}
