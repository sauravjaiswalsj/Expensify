package com.tracker.expenses.money.infra;

import com.tracker.expenses.money.enums.OutboxStatus;
import com.tracker.expenses.money.model.OutboxEvent;
import com.tracker.expenses.money.repository.OutboxEventRepository;
import com.tracker.expenses.money.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPoller {
    private final OutboxEventRepository  outboxEventRepository;
    private final EmailService emailService;

    @Scheduled(fixedDelayString = "${outbox.poller.delay-ms:10000}")
    public void poll() {
        Date now = new Date();


        List<OutboxEvent> events =
                outboxEventRepository.findTop20ByOutboxStatusAndNextAttemptAtBeforeOrderByCreatedAtAsc(
                        OutboxStatus.PENDING,
                        now
                );

        for (OutboxEvent event : events) {
            process(event);
        }
    }

    private void process(OutboxEvent event) {
        try{
            event.setOutboxStatus(OutboxStatus.PROCESSING);
            event.setUpdatedAt(new Date());
            outboxEventRepository.save(event);
            if ("USER_REGISTERED".equals(event.getEventType())) {
                processUserRegistered(event);
            }else{
                log.warn(event.getEventType()+" unknown event not processed");
            }
            event.setOutboxStatus(OutboxStatus.PROCESSED);
            event.setProcessedAt(new Date());
            outboxEventRepository.save(event);
        }
        catch (Exception ex){
            int attempts = event.getAttempts() + 1;
            event.setAttempts(attempts);
            event.setLastError(ex.getMessage());
            event.setUpdatedAt(new Date());

            if (attempts >= event.getMaxAttempts()) {
                event.setOutboxStatus(OutboxStatus.FAILED);
            }
            else {
                event.setOutboxStatus(OutboxStatus.PENDING);
                event.setNextAttemptAt(nextRetry(attempts));
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

    private void processUserRegistered(OutboxEvent event) {
        Map<String, Object> payload = event.getPayload();

        String email = (String) payload.get("email");
        String code = (String) payload.get("verificationCode");

        emailService.sendWelcomeEmail(email);
        emailService.sendVerificationEmail(email, code);
    }
}
