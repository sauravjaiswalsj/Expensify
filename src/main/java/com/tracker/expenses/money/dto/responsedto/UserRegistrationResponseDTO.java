package com.tracker.expenses.money.dto.responsedto;

import com.tracker.expenses.money.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRegistrationResponseDTO {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean accountVerified;
}
