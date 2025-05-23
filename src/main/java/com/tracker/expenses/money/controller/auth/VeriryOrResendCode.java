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
     * Handles user verification requests by validating the provided verification code.
     *
     * Accepts a verification request payload and returns an HTTP response indicating the result of the verification process.
     * Responds with appropriate status codes and messages for cases such as user not found, expired or incorrect code, user already verified, or internal errors.
     *
     * @param verifyUserDTO the verification data submitted by the user
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
     * Handles requests to resend a verification code to a user.
     *
     * @param username the username for which to resend the verification code
     * @return an HTTP response with a status and message indicating the result of the resend operation
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
