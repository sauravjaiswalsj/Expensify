package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.dto.userdto.PasswordResetDTO;
import com.tracker.expenses.money.exception.UserAlreadyVerifiedException;
import com.tracker.expenses.money.exception.VerificationCodeExpiredException;
import com.tracker.expenses.money.exception.VerificationCodeIncorrectException;
import com.tracker.expenses.money.services.UserService;
import jakarta.validation.Valid;
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

    @PostMapping("/forget")
    public ResponseEntity<String> forgetPassword(@RequestParam String username) {
        try{
            var res = userService.forgetUserPassword(username);
            return ResponseEntity.status(res.getHeader().getHttpResponseStatus()).body(res.getHeader().getResponseMessage());
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }catch (VerificationCodeExpiredException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification code expired");
        }catch (VerificationCodeIncorrectException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Verification code incorrect");
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already verified");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
    @PostMapping("/forget/newPassword")
    public ResponseEntity<String> verifyForgetPassword(@RequestBody @Valid PasswordResetDTO passwordResetDTO) {
        try{
            var res = userService.resetForgetPassword(passwordResetDTO);
            return ResponseEntity.status(res.getHeader().getHttpResponseStatus()).body(res.getHeader().getResponseMessage());
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }catch (VerificationCodeExpiredException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification code expired");
        }catch (VerificationCodeIncorrectException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Verification code incorrect");
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already verified");
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
}