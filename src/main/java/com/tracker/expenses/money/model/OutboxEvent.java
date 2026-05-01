package com.tracker.expenses.money.model;

import com.tracker.expenses.money.enums.EventType;
import com.tracker.expenses.money.enums.OutboxStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Data
@Document(collection = "outbox_event")
@CompoundIndex(
        name = "outbox_status_next_attempt_idx",
        def = "{'outboxStatus': 1, 'nextAttemptAt': 1}"
)
public class OutboxEvent {
    @Id
    private String id;

    private EventType eventType; // USER_REGISTERED, EXPENSE_CREATED, etc.
    private String aggregateType; // USER
    private String aggregateId; // user id

    private Map<String, Object> payload;

    private OutboxStatus outboxStatus; // PENDING, PROCESSING, PROCESSED, FAILED
    private int attempts;
    private int maxAttempts;

    private Date nextAttemptAt;
    private Date createdAt;
    private Date updatedAt;
    private Date processedAt;

    private String lastError;
}
