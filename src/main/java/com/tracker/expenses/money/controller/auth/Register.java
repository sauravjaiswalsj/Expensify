package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.common.LogSanitizer;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.responsedto.UserRegistrationResponseDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserException;
import com.tracker.expenses.money.exception.InvalidUserLengthException;
import com.tracker.expenses.money.exception.UserAlreadyExistsException;
import com.tracker.expenses.money.service.UserService;
import com.tracker.expenses.money.model.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("/auth")
@RestController
public class Register {
    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserRegistrationResponseDTO>> register(@Valid @RequestBody UserDTO user) {
        try{
            var response = userService.addUser(user);
            var httpResponseStatus = response.getHeader().getHttpResponseStatus();
            int code = httpResponseStatus.value();
            User savedUser = response.getMethodBody();
            UserRegistrationResponseDTO responseBody = new UserRegistrationResponseDTO(
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getFirstName(),
                    savedUser.getLastName(),
                    savedUser.getRole(),
                    savedUser.isAccountVerified()
            );
            log.info("AUDIT auth.signup.success userHash={} correlationId={}",
                    LogSanitizer.hashIdentifier(user.getUsername()), ApiResponses.correlationId());
            return ResponseEntity
                    .status(code)
                    .body(ApiResponses.success(response.getHeader().getResponseMessage(), responseBody));

        }catch (InvalidUserException | InvalidUserLengthException |
                InvalidEmailException ex){
            return ResponseEntity.status(400).body(ApiResponses.error(ex.getMessage(), "INVALID_USER"));
        }
        catch (UserAlreadyExistsException e){
            return ResponseEntity.status(409).body(ApiResponses.error("CONFLICT user already exists.", "USER_ALREADY_EXISTS"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponses.error("Internal Server Error", "INTERNAL_SERVER_ERROR"));
        }

    }
}
