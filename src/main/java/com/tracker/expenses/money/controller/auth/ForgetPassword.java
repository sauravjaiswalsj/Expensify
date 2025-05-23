package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.common.Validation;
import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.exception.UserAlreadyVerifiedException;
import com.tracker.expenses.money.exception.VerificationCodeExpiredException;
import com.tracker.expenses.money.exception.VerificationCodeIncorrect;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.dto.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
public class ForgetPassword {
    @Autowired
    private UserService userService;

    /**
     * Initiates the password reset process for a user by username.
     *
     * Accepts a username in the request body and triggers the password reset workflow. Returns an HTTP response with a status and message based on the outcome, including specific error responses for user not found, expired or incorrect verification codes, and already verified users.
     *
     * @param username the username of the account to reset the password for
     * @return a ResponseEntity containing the status and message of the password reset initiation
     */
    @PostMapping("/forget")
    public ResponseEntity<?> forgetPassword(@RequestBody String username) {
        try{
            var res = userService.forgetUserPassword(username);
            return ResponseEntity.status(res.getHeader().getHttpResponseStatus()).body(res.getHeader().getResponseMessage());
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }catch (VerificationCodeExpiredException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification code expired");
        }catch (VerificationCodeIncorrect e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Verification code incorrect");
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already verified");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
    /**
     * Handles password reset verification and updates the user's password.
     *
     * Accepts a password reset request containing verification and new password details, delegates the reset process to the user service, and returns an HTTP response based on the outcome. Responds with specific HTTP statuses and messages for known error conditions such as user not found, expired or incorrect verification code, or user already verified.
     *
     * @param passwordResetDTO the password reset request containing verification and new password information
     * @return HTTP response indicating the result of the password reset verification
     */
    @PostMapping("/forget/newPassword")
    public ResponseEntity<?> verifyForgetPassword(@RequestBody PasswordResetDTO passwordResetDTO) {
        try{
            var res = userService.resetForgetPassword(passwordResetDTO);
            return ResponseEntity.status(res.getHeader().getHttpResponseStatus()).body(res.getHeader().getResponseMessage());
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }catch (VerificationCodeExpiredException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification code expired");
        }catch (VerificationCodeIncorrect e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Verification code incorrect");
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already verified");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
}