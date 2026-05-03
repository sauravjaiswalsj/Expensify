package com.tracker.expenses.money.infra;

import com.tracker.expenses.money.common.LogSanitizer;
import com.tracker.expenses.money.enums.EventType;
import com.tracker.expenses.money.enums.OutboxStatus;
import com.tracker.expenses.money.model.OutboxEvent;
import com.tracker.expenses.money.repository.OutboxEventRepository;
import com.tracker.expenses.money.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPoller {
    private final OutboxEventRepository  outboxEventRepository;
    private final EmailService emailService;
    private final MongoTemplate mongoTemplate;

    @Scheduled(fixedDelayString = "${outbox.poller.delay-ms:10000}")
    public void poll() {
        for (int i = 0; i < 20; i++) {
            OutboxEvent event = claimNextEvent();
            if (event == null) {
                return;
            }
            process(event);
        }
    }

    private OutboxEvent claimNextEvent() {
        Date now = new Date();
        Query query = new Query()
                .addCriteria(Criteria.where("outboxStatus").is(OutboxStatus.PENDING))
                .addCriteria(Criteria.where("nextAttemptAt").lte(now))
                .with(Sort.by(Sort.Direction.ASC, "createdAt"));

        Update update = new Update()
                .set("outboxStatus", OutboxStatus.PROCESSING)
                .set("updatedAt", now);

        OutboxEvent event = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                OutboxEvent.class
        );

        if (event != null) {
            log.info("Claimed outbox event id={} type={} aggregateType={} aggregateId={} attempts={}/{}",
                    event.getId(),
                    event.getEventType(),
                    event.getAggregateType(),
                    event.getAggregateId(),
                    event.getAttempts(),
                    event.getMaxAttempts());
        }

        return event;
    }

    private void process(OutboxEvent event) {
        try{
            Map<String, Object> payload = event.getPayload();
            if (payload == null) {
                throw new IllegalArgumentException("Outbox event payload is missing");
            }

            String email = (String) payload.get("email");
            String code = (String) payload.get("verificationCode");
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Outbox event email is missing");
            }

            String emailHash = LogSanitizer.hashIdentifier(email);
            log.info("Processing outbox event id={} type={} emailHash={}",
                    event.getId(),
                    event.getEventType(),
                    emailHash);

            if (EventType.USER_REGISTERED.equals(event.getEventType())) {
                if (code == null || code.isBlank()) {
                    throw new IllegalArgumentException("Verification code is missing");
                }
                emailService.sendWelcomeEmail(email);
                emailService.sendVerificationEmail(email, code);
            }
            else if (EventType.PASSWORD_RESET_REQUESTED.equals(event.getEventType())) {
                if (code == null || code.isBlank()) {
                    throw new IllegalArgumentException("Password reset code is missing");
                }
                emailService.sendPasswordResetEmail(email, code);
            }
            else if (EventType.PASSWORD_RESET_SUCCESS.equals(event.getEventType())) {
                emailService.sendResetSuccessEmail(email);
            }
            else if (EventType.VERIFY_EMAIL_REQUESTED.equals(event.getEventType())) {
                if (code == null || code.isBlank()) {
                    throw new IllegalArgumentException("Verification code is missing");
                }
                emailService.sendVerificationEmail(email, code);
            }
            else if (EventType.VERIFY_EMAIL_SENT.equals(event.getEventType())) {
                emailService.sendVerificationSuccessEmail(email);
            }

            else{
                throw new IllegalArgumentException("Unknown outbox event type: " + event.getEventType());
            }
            event.setOutboxStatus(OutboxStatus.PROCESSED);
            event.setProcessedAt(new Date());
            outboxEventRepository.save(event);
            log.info("Processed outbox event id={} type={} emailHash={}",
                    event.getId(),
                    event.getEventType(),
                    emailHash);
        }
        catch (Exception ex){
            int attempts = event.getAttempts() + 1;
            event.setAttempts(attempts);
            event.setLastError(ex.getMessage());
            event.setUpdatedAt(new Date());

            if (attempts >= event.getMaxAttempts()) {
                event.setOutboxStatus(OutboxStatus.FAILED);
                log.error("Outbox event id={} type={} failed permanently after {}/{} attempts: {}",
                        event.getId(),
                        event.getEventType(),
                        attempts,
                        event.getMaxAttempts(),
                        ex.getMessage(),
                        ex);
            }
            else {
                event.setOutboxStatus(OutboxStatus.PENDING);
                event.setNextAttemptAt(nextRetry(attempts));
                log.warn("Outbox event id={} type={} failed attempt {}/{}; retryAt={}: {}",
                        event.getId(),
                        event.getEventType(),
                        attempts,
                        event.getMaxAttempts(),
                        event.getNextAttemptAt(),
                        ex.getMessage());
            }

            outboxEventRepository.save(event);
        }
    }

    private Date nextRetry(int attempts) {
        long delaySeconds = switch (attempts) {
            case 1 -> 60L; // 1 minute
            case 2 -> 300L; // 5 minutes
            case 3 -> 900L; // 15 minutes
            default -> 3600L; // 1 hour
        };
        return new Date(System.currentTimeMillis() + delaySeconds * 1000);
    }
}
