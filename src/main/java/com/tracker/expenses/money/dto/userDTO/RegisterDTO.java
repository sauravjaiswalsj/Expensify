package com.tracker.expenses.money.dto.userDTO;

import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
}
