package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.common.GenerateCodes;
import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.dto.userDTO.PasswordResetDTO;
import com.tracker.expenses.money.dto.userDTO.RegisterDTO;
import com.tracker.expenses.money.enums.Role;
import com.tracker.expenses.money.services.AuthenticationService;
import com.tracker.expenses.money.services.EmailService;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.exception.IncorrectPasswordException;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.UserAlreadyExistsException;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.tracker.expenses.money.common.GetCurrentTime.convertLocalDateTimeToDate;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private void isUserValid(User user){
        String username = user.getUsername().toLowerCase();
        Validation.isUsernameValid(username);
        if(userRepository.findByUsername(username)!=null){
            throw new UserAlreadyExistsException("User already exists "+username);
        }
        Validation.isEmailValid(user.getEmail());
    }

    public User findByUsername(String username) {
        username = username.toLowerCase();
        return  userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        email = email.toLowerCase();
        return userRepository.findByEmail(email);
    }

    @Transactional
    public Response<ResponseHeader, User> addUser(RegisterDTO registerDTO){
        User user = new User(
                registerDTO.getUsername(),
                registerDTO.getPassword(),
                registerDTO.getFirstName(),
                registerDTO.getLastName(),
                registerDTO.getEmail()
        );

        isUserValid(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        user.setCreatedAt(convertLocalDateTimeToDate());
        user.setUpdatedAt(convertLocalDateTimeToDate());
        user.setAccountVerified(false);
        user.setVerificationCode(GenerateCodes.generateVerificationCode());
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        var res = userRepository.save(user);
        try {
            emailService.sendWelcomeEmail(user.getEmail());
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }catch (Exception ex){
            log.error("Error sending verification email to user {}", user.getUsername());
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }
        return new Response<>(new ResponseHeader(HttpStatus.CREATED, "User created successfully"), res);
    }

    public List<User> findAll(){
        return userRepository.findAll();
    }

    public Response<ResponseHeader, User> verifyUser(User user){
        try{
             User res = findByUsername(user.getUsername());
             if (res == null){
                 throw new UsernameNotFoundException("User does not exist");
             }

             if (!res.getPassword().equals(user.getPassword())){
                 throw new IncorrectPasswordException("Password is wrong");
             }
             return new Response<>(new ResponseHeader(HttpStatus.OK, "User verified successfully"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), user);
        }catch (IncorrectPasswordException ex){
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, ex.getMessage()), user);
        }catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), user);
        }
    }

    public Response<ResponseHeader, User> updatePassword(PasswordResetDTO passwordResetDTO){
        User userdata = null;
        try{
            userdata = findByUsername(passwordResetDTO.getUsername());
            if (userdata == null){
                throw new UsernameNotFoundException("User does not exist");
            }
            userdata.setPassword(passwordEncoder.encode(passwordResetDTO.getPassword()));
            var res = userRepository.save(userdata);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "Password successfully reset"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), userdata);
        }
        catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), userdata);
        }
    }

    public Response<ResponseHeader, User> updateUser(User user){
        try{
            User userdata = findByUsername(user.getUsername());
            if (userdata == null){
                throw new UsernameNotFoundException("User does not exist");
            }
            if (user.getEmail() != null){
                Validation.isEmailValid(user.getEmail());
                userdata.setEmail(user.getEmail());
            }
            if (user.getPassword() != null){
                userdata.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            var res = userRepository.save(userdata);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "User successfully updated"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), user);
        }catch (InvalidEmailException ex){
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, ex.getMessage()), user);
        }catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), user);
        }
    }
}
