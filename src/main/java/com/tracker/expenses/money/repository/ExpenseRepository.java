package com.tracker.expenses.money.repository;

import com.tracker.expenses.money.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@EnableMongoRepositories
@Repository
public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByUsername(String username);

    @Query(value = "{ '_id': ?0, 'username': ?1 }")
    Optional<Expense> findByIdAndUsername(String id, String username);

    @Query(value = "{ '_id': ?0, 'username': ?1 }", delete = true)
    long deleteByIdAndUsername(String id, String username);
}
