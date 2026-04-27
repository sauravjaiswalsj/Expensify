package com.tracker.expenses.money.repository;

import com.tracker.expenses.money.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableMongoRepositories
@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByUsername(String username);
}
