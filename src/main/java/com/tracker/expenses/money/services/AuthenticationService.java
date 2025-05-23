package com.tracker.expenses.money.services;

import com.tracker.expenses.money.dto.userDTO.LoginDTO;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationService {
    UserDetails authenticateUser(LoginDTO loginDTO);
}
