package com.tracker.expenses.money.dto.mapper;

import com.tracker.expenses.money.dto.SerializableDTO;
import com.tracker.expenses.money.dto.userDTO.LoginDTO;
import com.tracker.expenses.money.model.User;
import org.springframework.stereotype.Component;

@Component
public class LoginDTOMapper implements SerializableDTO<LoginDTO, User> {

    public User setLoginDTO(LoginDTO loginDTO) {
        if (loginDTO == null || (loginDTO.getUsername() == null && loginDTO.getEmail() == null)) {
            return null;
        }
        User user = new User();
        user.setUsername(loginDTO.getUsername());
        user.setPassword(loginDTO.getPassword());
        if (loginDTO.getEmail() != null) {
            user.setEmail(loginDTO.getEmail());
        }
        return user;
    }

    public LoginDTO retriveLoginDTO(User user) {
        if (user == null) {
            return null;
        }
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername(user.getUsername());
        loginDTO.setEmail(user.getEmail());
        return loginDTO;
    }
}
