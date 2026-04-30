package com.tracker.expenses.money.repository;

import com.tracker.expenses.money.enums.OutboxStatus;
import com.tracker.expenses.money.model.OutboxEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@EnableMongoRepositories
@Repository
public interface OutboxEventRepository extends MongoRepository<OutboxEvent, String> {
     OutboxEvent findFirstByOutboxStatusAndNextAttemptAtLessThanEqual(OutboxStatus status, java.util.Date now);
     List<OutboxEvent> findTop20ByOutboxStatusAndNextAttemptAtBeforeOrderByCreatedAtAsc(OutboxStatus status, java.util.Date now);
}
