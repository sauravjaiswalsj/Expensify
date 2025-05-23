package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.exception.UserAlreadyVerifiedException;
import com.tracker.expenses.money.exception.VerificationCodeExpiredException;
import com.tracker.expenses.money.exception.VerificationCodeIncorrect;
import com.tracker.expenses.money.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class VeriryOrResendCode {
    @Autowired
    private UserService userService;
    /**
     * Verifies a user's account using the provided verification code.
     *
     * Accepts a verification request containing user credentials and a verification code, and attempts to verify the user's account. Returns an HTTP response with a status and message indicating the result of the verification attempt.
     *
     * @param verifyUserDTO the verification request containing user credentials and code
     * @return HTTP response with status and message reflecting the verification outcome
     */
    @PostMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestBody VerifyUserDTO verifyUserDTO){
        try{
            var res = userService.verifyUser(verifyUserDTO);
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
     * Handles POST requests to resend a verification code to a user.
     *
     * Accepts a username as a request parameter and triggers the resending of the verification code.
     * Returns an HTTP response with a status and message based on the outcome, including specific error responses for user not found, user already verified, or incorrect verification code.
     *
     * @param username the username of the user to resend the verification code to
     * @return HTTP response indicating the result of the resend operation
     */
    @PostMapping("/resend")
    public ResponseEntity<String> resendCode(@RequestParam String username){
        try{
            var res = userService.resendVerificationCode(username);
            return ResponseEntity.status(res.getHeader().getHttpResponseStatus()).body(res.getHeader().getResponseMessage());
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already verified");
        }catch (VerificationCodeIncorrect e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Verification code incorrect");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
}
