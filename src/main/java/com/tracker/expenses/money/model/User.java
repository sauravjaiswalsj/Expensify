package com.tracker.expenses.money.model;

import com.tracker.expenses.money.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

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
    @Schema(description = "The unique ID of the book", example = "1", hidden = true)
    private String _id;

    @Schema(description = "This is the username of the person", example = "user@123")
    @NotNull
    @Indexed(unique = true)
    private String username;

    @NotNull
    @Schema(description = "This is the password of the person")
    private String password;

    @Schema(description = "This is the firstname of the person")
    private String firstName;

    @Schema(description = "This is the lastname of the person")
    private String lastName;

    @Indexed(unique = true)
    @NotNull
    @Schema(description = "This is the email of the person", example = "user-name@gmail.com",nullable = false)
    private String email;

    @Schema(description = "This is the created time of the person")
    private Date createdAt;
    @Schema(description = "This is the updated time of the person")
    private Date updatedAt;

    @DBRef
    private List<Expense> expenses = new ArrayList<>();
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
