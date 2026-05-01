package com.tracker.expenses.money.controller.ai;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.aidto.AiInsightRequestDTO;
import com.tracker.expenses.money.dto.aidto.AiInsightResponseDTO;
import com.tracker.expenses.money.service.AiInsightService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GetAiInsight {
    private final AiInsightService aiInsightService;
    private final Authentication authentication;

    public GetAiInsight(AiInsightService aiInsightService, Authentication authentication) {
        this.aiInsightService = aiInsightService;
        this.authentication = authentication;
    }

    @PostMapping("/ai/insights")
    public ResponseEntity<ApiResponse<AiInsightResponseDTO>> getInsight(@Valid @RequestBody AiInsightRequestDTO request) {
        String username = authentication.getCurrentUserName();

        if (username == null) {
            return ResponseEntity.status(401).body(ApiResponses.error("User Not Authenticated", "UNAUTHENTICATED"));
        }

        AiInsightResponseDTO insight = aiInsightService.getInsight(username, request.getPrompt());
        return ResponseEntity.ok(ApiResponses.success("AI insight generated successfully", insight));
    }
}
