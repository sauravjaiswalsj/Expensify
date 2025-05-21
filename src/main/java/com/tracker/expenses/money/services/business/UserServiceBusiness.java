package com.tracker.expenses.money.services.business;

import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserLength;
import com.tracker.expenses.money.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserServiceBusiness {
    @Autowired
    private UserRepository userRepository;

    public void isEmailValid(String email){
        if (!Validation.emailValid(email)){
            throw new InvalidEmailException("Invalid email"+email);
        }
    }

    public void isUsernameValid(String username){
        int length = username.length();

        if (length < 4 || length > 20){
            throw new InvalidUserLength("Username must be between 4 and 20 characters");
        }
    }
}
