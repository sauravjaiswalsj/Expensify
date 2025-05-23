package com.tracker.expenses.money.services;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    Response<ResponseHeader, User> addUser(UserDTO userDTO);
    List<User> findAll();
    User findByUsername(String username);
    User findByEmail(String email);
    Response<ResponseHeader, Void> verifyUser(VerifyUserDTO verifyUserDTO);
    Response<ResponseHeader, User> updatePassword(PasswordResetDTO passwordResetDTO);
    Response<ResponseHeader, User> updateUser(User user);
    Response<ResponseHeader, Void> resendVerificationCode(String username);
    UserDTO authenticateUser(LoginDTO loginDTO);
    Response<ResponseHeader, Void> forgetUserPassword(String verificationCode);
    Response<ResponseHeader, Void> resetForgetPassword(PasswordResetDTO passwordResetDTO);
}
