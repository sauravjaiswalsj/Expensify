package com.tracker.expenses.money.service.impl;

import com.tracker.expenses.money.common.GenerateCodes;
import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.enums.Role;
import com.tracker.expenses.money.exception.*;
import com.tracker.expenses.money.service.EmailService;
import com.tracker.expenses.money.service.UserService;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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
    @Autowired
    private AuthenticationManager authenticationManager;

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
    public Response<ResponseHeader, User> addUser(UserDTO userDTO){
        User user = new User(
                userDTO.getUsername(),
                userDTO.getPassword(),
                userDTO.getFirstName(),
                userDTO.getLastName(),
                userDTO.getEmail()
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
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronizationAdapter() {
                @Override public void afterCommit() {
                    emailService.sendWelcomeEmail(user.getEmail());
                    emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
                }
            });
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

    //TODO: add email based verification
    @Transactional
    public Response<ResponseHeader, Void> verifyUser(VerifyUserDTO verifyUserDTO){
        if (verifyUserDTO.getUsername() == null || verifyUserDTO.getUsername().isEmpty()) {
            throw new UsernameNotFoundException("Username is empty");
        }
        User user = findByUsername(verifyUserDTO.getUsername());
        if (user == null){
            throw new UsernameNotFoundException("User does not exist");
        }
        if (user.isAccountVerified()){
            throw new UserAlreadyVerifiedException("User already verified");
        }
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())){
            throw new VerificationCodeExpiredException("Verification code has expired");
        }
        if (!user.getVerificationCode().equals(verifyUserDTO.getVerificationCode())){
            throw new VerificationCodeIncorrectException("Verification code is incorrect");
        }
        else{
            user.setAccountVerified(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiresAt(null);
            user.setUpdatedAt(convertLocalDateTimeToDate());
            userRepository.save(user);

            emailService.sendVerificationSuccessEmail(user.getEmail());
            return new Response<>(new ResponseHeader(HttpStatus.OK, "User successfully verified"));
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

    public Response<ResponseHeader, Void> resendVerificationCode(String username){
        if (username == null || username.isEmpty()) {
            throw new UsernameNotFoundException("Username is empty");
        }
        User user = findByUsername(username);
        if (user == null){
            throw new UsernameNotFoundException("User does not exist");
        }
        if (user.isAccountVerified()){
            throw new UserAlreadyVerifiedException("User already verified");
        }
        try {
            if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())){
                user.setVerificationCode(GenerateCodes.generateVerificationCode());
            }
            String code = user.getVerificationCode() == null || user.getVerificationCode().isEmpty() ? GenerateCodes.generateVerificationCode() : user.getVerificationCode();
            emailService.sendVerificationEmail(user.getEmail(), code);
        }catch (Exception ex){
            log.error("Error sending verification email. Retrying...");
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }finally {
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);
        }
        return new Response<>(new ResponseHeader(HttpStatus.OK, "Verification code resent successfully"));
    }


    public UserDTO authenticateUser(LoginDTO loginDTO) {
        try{
            User user = findByUsername(loginDTO.getUsername());
            if (user == null) {
                throw new UsernameNotFoundException("User not found");
            }

            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginDTO.getUsername(), loginDTO.getPassword()));

            if (!user.isAccountVerified()) {
                throw new UserNotVerifiedException("User not verified");
            }

            log.info("User {} authenticated successfully", loginDTO.getUsername());

            return new UserDTO(
                    user.getUsername(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole().name()
            );
        } catch (UserNotVerifiedException ex) {
            log.error("Verify user {}", loginDTO.getUsername());
            throw new UserNotVerifiedException("User not Verified. Please verify your account.");
        } catch(BadCredentialsException e){
            log.error("Bad credentials for user {}", loginDTO.getUsername());
            throw new BadCredentialsException("Invalid credentials.");
        }
        catch (UsernameNotFoundException e) {
            log.error("User not found: {}", loginDTO.getUsername());
            throw new UsernameNotFoundException("User not found.");
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
            throw new AuthenticationException("Authentication failed.") {};
        }
    }

    public Response<ResponseHeader, Void> forgetUserPassword(String username){
            User user = findByUsername(username);
            if (user == null){
                throw new UsernameNotFoundException("User does not exist");
            }
            String code = GenerateCodes.generateVerificationCode();
            user.setVerificationCode(code);
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
        try{
            emailService.sendPasswordResetEmail(user.getEmail(), code);
        }catch (RuntimeException ex){
            log.error("Email Retrying...");
            emailService.sendPasswordResetEmail(user.getEmail(),  code);
        }
        return new Response<>(new ResponseHeader(HttpStatus.OK, "Password reset code sent successfully"));
    }

    public Response<ResponseHeader, Void> resetForgetPassword(PasswordResetDTO passwordResetDTO){
        User user = findByUsername(passwordResetDTO.getUsername());
        if (user == null){
            throw new UsernameNotFoundException("User does not exist");
        }
        if (passwordResetDTO.getVerificationCode() == null || passwordResetDTO.getVerificationCode().isEmpty()) {
            throw new VerificationCodeIncorrectException("Verification code is empty");
        }
        if (user.getVerificationCodeExpiresAt() == null){
            throw new VerificationCodeExpiredException("Verification code has expired. Please request a new one.");
        }
        if (!user.getVerificationCode().equals(passwordResetDTO.getVerificationCode())){
            throw new VerificationCodeIncorrectException("Verification code is incorrect");
        }
        if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())){
            throw new VerificationCodeExpiredException("Verification code has expired");
        }
        user.setPassword(passwordEncoder.encode(passwordResetDTO.getPassword()));
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        user.setUpdatedAt(convertLocalDateTimeToDate());
        userRepository.save(user);

        try {
            emailService.sendResetSuccessEmail(user.getEmail());
        }catch (Exception ex){
            log.error("Sending Email. Retrying...");
            emailService.sendResetSuccessEmail(user.getEmail());
        }
        return new Response<>(new ResponseHeader(HttpStatus.OK, "Password successfully reset"));

    }
}
