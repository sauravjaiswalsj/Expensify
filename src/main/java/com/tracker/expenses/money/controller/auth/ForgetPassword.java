package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.userDTO.PasswordResetDTO;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.dto.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ForgetPassword {
    @Autowired
    private UserService userService;
    @Autowired
    private Authentication authentication;

    @PostMapping("/forget")
    public ResponseEntity<?> forgetPassword(@RequestBody PasswordResetDTO passwordResetDTO) {
        if (!authentication.auth())
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));

        if (passwordResetDTO == null || !passwordResetDTO.getPassword().equals(passwordResetDTO.getConfirmPassword())) {
            return ResponseEntity.status(400).body(new Response(false, "Password does not match"));
        }

        if (!Validation.passwordValid(passwordResetDTO.getPassword())) {
            return ResponseEntity.status(400).body(new Response(false, "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"));
        }
        var response = userService.updatePassword(passwordResetDTO);
        var httpResponseStatus = response.getHeader().getHttpResponseStatus();
        int code = httpResponseStatus.value();
        return ResponseEntity.status(code).body(response);
    }
}
