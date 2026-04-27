package com.tracker.expenses.money.model;

import com.tracker.expenses.money.enums.Currency;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import jakarta.persistence.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Schema(description = "Expense")
@Document(collection = "expense")
public class Expense {

    @Id
    private String _id;

    @Indexed
    @Schema(description = "This is the username of the person", example = "user@123")
    private String username;

    @Schema(description = "This is the amount spent")
    private double amount;

    @Schema(description = "This is the category of the expense")
    private String category;

    @Schema(description = "This is the description of the expense")
    private String description;

    @Schema(description = "This is the paymentType of the expense")
    private String paymentType;

    @Schema(description = "This is the date of the expense")
    private Date date;

    @Schema(description = "This is the created time of the expense")
    private Date createdAt;
    @Schema(description = "This is the updated time of the expense")
    private Date updatedAt;

    @Schema(description = "This is the currency.", example = "INR")
    private Currency currency;

    @DBRef(lazy = true)
    private User user;
}
