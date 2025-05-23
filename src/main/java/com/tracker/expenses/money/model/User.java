package com.tracker.expenses.money.model;

import com.tracker.expenses.money.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "User")
@Document(collection = "user") // we are creating a collection in Mongo if it doesn't exist.
//@CompoundIndex(name = "user_idx", def = "{'username' : 1, 'email' : 1}", unique = true)
public class User {
    @Id //this is the primary key.
    private String _id;

    @Schema(description = "User's unique username", example = "john_doe")
    @NotNull
    @NotBlank(message = "username is required")
    @Indexed(unique = true)
    @Size(min = 3, max = 50, message = "username must be between 3 and 20 characters long")
    private String username;

    @NotNull
    @NotBlank(message = "Password is required")
    @Size(min = 4, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{4,}$",
            message = "Password must contain at least one letter, one number, and one special character"
    )
    @Schema(description = "User's password", example = "StrongP@ss123")
    private String password;

    @NotBlank(message = "First name is required")
    @Schema(description = "User's first name", example = "John")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Schema(description = "User's last name", example = "Doe")
    private String lastName;

    @NotNull
    @Indexed(unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;

    @Schema(description = "This is the created time of the person")
    private Date createdAt;

    @Schema(description = "This is the updated time of the person")
    private Date updatedAt;

    @Schema(description = "verification_code")
    private String verificationCode;

    @Schema(description = "verification_expiration")
    private LocalDateTime verificationCodeExpiresAt;

    @Getter
    @Setter
    @Schema(description = "Checks if account is verified")
    private boolean isAccountVerified;

    @DBRef
    private List<Expense> expenses = new ArrayList<>();

    @NotNull
    @Schema(description = "This is the user role.", example = "USER")
    private Role role;

    public User(String username, String password, String firstName, String lastName, String email) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
}
