package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.userdto.VerifyUserDTO;
import com.tracker.expenses.money.exception.UserAlreadyVerifiedException;
import com.tracker.expenses.money.exception.VerificationCodeExpiredException;
import com.tracker.expenses.money.exception.VerificationCodeIncorrectException;
import com.tracker.expenses.money.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
public class VerifyOrResendCode {
    @Autowired
    private UserService userService;
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyUser(@RequestBody @Valid VerifyUserDTO verifyUserDTO){
        try{
            var res = userService.verifyUser(verifyUserDTO);
            log.info("AUDIT auth.verify.success username={} correlationId={}", verifyUserDTO.getUsername(), ApiResponses.correlationId());
            return ResponseEntity
                    .status(res.getHeader().getHttpResponseStatus())
                    .body(ApiResponses.success(res.getHeader().getResponseMessage(), null));
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponses.error("User not found", "USER_NOT_FOUND"));
        }catch (VerificationCodeExpiredException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponses.error("Verification code expired", "VERIFICATION_CODE_EXPIRED"));
        }catch (VerificationCodeIncorrectException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponses.error("Verification code incorrect", "VERIFICATION_CODE_INCORRECT"));
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponses.error("User already verified", "USER_ALREADY_VERIFIED"));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponses.error("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    }

    @PostMapping("/resend")
    public ResponseEntity<ApiResponse<Void>> resendCode(@RequestParam String username){
        try{
            var res = userService.resendVerificationCode(username);
            log.info("AUDIT auth.verification_resend.success username={} correlationId={}", username, ApiResponses.correlationId());
            return ResponseEntity
                    .status(res.getHeader().getHttpResponseStatus())
                    .body(ApiResponses.success(res.getHeader().getResponseMessage(), null));
        }catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponses.error("User not found", "USER_NOT_FOUND"));
        }catch (UserAlreadyVerifiedException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponses.error("User already verified", "USER_ALREADY_VERIFIED"));
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponses.error("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    }
}
