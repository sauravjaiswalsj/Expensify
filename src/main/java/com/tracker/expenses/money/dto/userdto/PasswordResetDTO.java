package com.tracker.expenses.money.dto.userdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetDTO {
    @NotBlank(message = "username is required")
    @Size(min = 3, max = 50, message = "username must be between 3 and 20 characters long")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 4, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{4,}$",
            message = "Password must contain at least one letter, one number, and one special character"
    )
    private String password;
    
    @NotBlank(message = "Confirm password is required")
    @Size(min = 4, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{4,}$",
            message = "Password must contain at least one letter, one number, and one special character"
    )
    private String confirmPassword;

    @NotBlank(message = "Verification Code is required")
    private String verificationCode;
}
