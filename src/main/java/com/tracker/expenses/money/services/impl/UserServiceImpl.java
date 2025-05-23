package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.common.GenerateCodes;
import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.enums.Role;
import com.tracker.expenses.money.exception.*;
import com.tracker.expenses.money.services.EmailService;
import com.tracker.expenses.money.services.UserService;
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

    /****
     * Validates the provided user's username and email.
     *
     * Checks if the username is valid and not already taken, and verifies the email format.
     * Throws a UserAlreadyExistsException if the username is already in use.
     *
     * @param user the user entity to validate
     * @throws UserAlreadyExistsException if the username already exists
     */
    private void isUserValid(User user){
        String username = user.getUsername().toLowerCase();
        Validation.isUsernameValid(username);
        if(userRepository.findByUsername(username)!=null){
            throw new UserAlreadyExistsException("User already exists "+username);
        }
        Validation.isEmailValid(user.getEmail());
    }

    /****
     * Retrieves a user entity by username, performing a case-insensitive lookup.
     *
     * @param username the username to search for
     * @return the User entity matching the given username, or null if not found
     */
    public User findByUsername(String username) {
        username = username.toLowerCase();
        return  userRepository.findByUsername(username);
    }

    /****
     * Retrieves a user by their email address, performing a case-insensitive lookup.
     *
     * @param email the email address to search for
     * @return the User associated with the given email, or null if not found
     */
    public User findByEmail(String email) {
        email = email.toLowerCase();
        return userRepository.findByEmail(email);
    }

    /**
     * Registers a new user with the provided details, validates input, encodes the password, assigns default role and timestamps, generates a verification code, saves the user, and sends welcome and verification emails.
     *
     * @param userDTO the data transfer object containing user registration details
     * @return a response containing the created user and HTTP status CREATED
     */
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
        try {
            emailService.sendWelcomeEmail(user.getEmail());
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }catch (Exception ex){
            log.error("Error sending verification email to user {}", user.getUsername());
            emailService.sendVerificationEmail(user.getEmail(), user.getVerificationCode());
        }
        return new Response<>(new ResponseHeader(HttpStatus.CREATED, "User created successfully"), res);
    }

    /****
     * Retrieves all users from the repository.
     *
     * @return a list of all users
     */
    public List<User> findAll(){
        return userRepository.findAll();
    }

    /**
     * Verifies a user's account using a verification code.
     *
     * Validates the provided username and verification code, checks for user existence, account verification status, and code expiration. If successful, marks the account as verified, clears verification data, updates the user, and sends a verification success email.
     *
     * @param verifyUserDTO contains the username and verification code for verification
     * @return a response indicating successful verification
     *
     * @throws UsernameNotFoundException if the username is missing or the user does not exist
     * @throws UserAlreadyVerifiedException if the user is already verified
     * @throws VerificationCodeExpiredException if the verification code has expired
     * @throws VerificationCodeIncorrect if the verification code is incorrect
     */
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
            throw new VerificationCodeIncorrect("Verification code is incorrect");
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

    /**
     * Updates the password for a user identified by the provided username.
     *
     * Finds the user, encodes the new password, saves the updated user, and returns a response indicating the outcome.
     *
     * @param passwordResetDTO contains the username and new password
     * @return a response with status and the updated user, or an error status if the user is not found or an error occurs
     */
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

    /**
     * Updates the email and/or password of an existing user.
     *
     * If the provided email is present, it is validated before updating. If the password is present, it is encoded before being saved. Returns a response indicating the outcome, including error details if the user is not found or the email is invalid.
     *
     * @param user the user entity containing updated email and/or password fields
     * @return a response with the updated user and status information
     */
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

    /**
     * Resends a verification code to the user's email address if the account is not yet verified.
     *
     * @param username the username of the user to resend the verification code to
     * @return a response indicating the verification code was resent successfully
     * @throws UsernameNotFoundException if the username is empty or the user does not exist
     * @throws UserAlreadyVerifiedException if the user account is already verified
     */
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
            String code = user.getVerificationCode().isEmpty() ? GenerateCodes.generateVerificationCode() : user.getVerificationCode();
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


    /****
     * Authenticates a user using the provided login credentials.
     *
     * Validates the user's existence and account verification status, then attempts authentication with the given username and password.
     * Throws specific exceptions if the user is not found, not verified, or if credentials are invalid.
     *
     * @param loginDTO the login credentials containing username and password
     * @return a UserDTO containing user details upon successful authentication
     * @throws UserNotVerifiedException if the user's account is not verified
     * @throws UsernameNotFoundException if the user does not exist
     * @throws BadCredentialsException if the credentials are invalid
     * @throws AuthenticationException for other authentication failures
     */
    public UserDTO authenticateUser(LoginDTO loginDTO) {
        try{
            User user = findByUsername(loginDTO.getUsername());
            if (user == null) {
                throw new UsernameNotFoundException("User not found");
            }
            if (!user.isAccountVerified()) {
                throw new UserNotVerifiedException("User not verified");
            }

            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginDTO.getUsername(), loginDTO.getPassword()));

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

    /****
     * Initiates the password reset process by generating and emailing a verification code to the user.
     *
     * Generates a password reset verification code for the specified username, sets its expiration to one hour from now, saves it to the user, and sends a password reset email. Retries email sending once if the initial attempt fails.
     *
     * @param username the username of the user requesting a password reset
     * @return a response indicating that the password reset code was sent successfully
     * @throws UsernameNotFoundException if the user does not exist
     */
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
            emailService.sendPasswordResetEmail(username,  code);
        }
        return new Response<>(new ResponseHeader(HttpStatus.OK, "Password reset code sent successfully"));
    }

    /**
     * Resets a user's password using a verification code and updates the user's credentials.
     *
     * Validates the provided verification code and its expiration for the specified user. If valid, updates the user's password, clears the verification code and its expiration, updates the modification timestamp, and sends a password reset success email. Throws exceptions if the user does not exist, the verification code is incorrect, or the code has expired.
     *
     * @param passwordResetDTO contains the username, new password, and verification code for password reset
     * @return a response indicating successful password reset
     *
     * @throws UsernameNotFoundException if the user does not exist
     * @throws VerificationCodeIncorrect if the verification code is incorrect
     * @throws VerificationCodeExpiredException if the verification code has expired
     */
    public Response<ResponseHeader, Void> resetForgetPassword(PasswordResetDTO passwordResetDTO){
        User user = findByUsername(passwordResetDTO.getUsername());
        if (user == null){
            throw new UsernameNotFoundException("User does not exist");
        }
        if (!user.getVerificationCode().equals(passwordResetDTO.getVerificationCode())){
            throw new VerificationCodeIncorrect("Verification code is incorrect");
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
