package com.tracker.expenses.money.services;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.dto.userDTO.PasswordResetDTO;
import com.tracker.expenses.money.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    Response<ResponseHeader, User> addUser(User user);
    List<User> findAll();
    User findByUsername(String username);
    User findByEmail(String email);
    Response<ResponseHeader, User> verifyUser(User user);
    Response<ResponseHeader, User> updatePassword(PasswordResetDTO passwordResetDTO);
    Response<ResponseHeader, User> updateUser(User user);
}
