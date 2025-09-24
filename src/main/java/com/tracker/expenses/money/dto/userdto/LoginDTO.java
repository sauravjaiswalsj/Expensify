package com.tracker.expenses.money.dto.userdto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginDTO {
    @NotBlank(message = "username is required")
    @Size(min = 4, max = 20, message = "username must be between 4 and 20 characters long")
    @Schema(description = "User's unique username", example = "john_doe")
    private String username;


    @Schema(description = "User's email address", example = "john.doe@example.com")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must contain at least one letter, one number, and one special character"
    )
    @Schema(description = "User's password", example = "StrongP@ss123")
    private String password;
}
