package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.config.security.JwtService;
import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import com.tracker.expenses.money.dto.responsedto.LoginResponseDTO;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.exception.UserNotVerifiedException;
import com.tracker.expenses.money.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequestMapping("/auth")
@RestController
public class Login {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> loginUser(@RequestBody @Valid LoginDTO loginDTO) {
        try {
            UserDTO userDetails = userService.authenticateUser(loginDTO);
            String jwtToken = jwtService.generateToken(userDetails.getUsername());
            LoginResponseDTO loginResponseDTO = new LoginResponseDTO(jwtToken, jwtService.getExpirationTime());
            log.info("AUDIT auth.login.success username={} correlationId={}", userDetails.getUsername(), ApiResponses.correlationId());
            return ResponseEntity.ok(ApiResponses.success("Login successful", loginResponseDTO));
        } catch (UserNotVerifiedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponses.error(ex.getMessage(), "USER_NOT_VERIFIED"));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponses.error(ex.getMessage(), "BAD_CREDENTIALS"));
        }
        catch (UsernameNotFoundException ex){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponses.error(ex.getMessage(), "USER_NOT_FOUND"));
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponses.error("Internal server error", "INTERNAL_SERVER_ERROR"));
        }
    }
}
