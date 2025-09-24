package com.tracker.expenses.money.dto.userdto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyUserDTO {
    @NotBlank(message = "username is required")
    private String username;

    @NotBlank(message = "Verification Code is required")
    private String verificationCode;
}
