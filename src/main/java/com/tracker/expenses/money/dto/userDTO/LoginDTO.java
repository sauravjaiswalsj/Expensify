package com.tracker.expenses.money.dto.userDTO;

import lombok.Data;

@Data
public class LoginDTO {
    private String username;
    private String email;
    private String password;
}
