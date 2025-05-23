package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.config.security.JwtService;
import com.tracker.expenses.money.dto.responsedto.LoginResponseDTO;
import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.exception.UserNotVerifiedException;
import com.tracker.expenses.money.services.UserService;
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

    /**
     * Authenticates a user with the provided login credentials and returns a JWT token upon successful authentication.
     *
     * Handles various authentication errors by returning appropriate HTTP status codes and error messages.
     *
     * @param loginDTO the login credentials submitted by the user
     * @return a response containing a JWT token and its expiration time if authentication is successful,
     *         or an error message with the corresponding HTTP status code if authentication fails
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDTO loginDTO) {
        try {
            UserDTO userDetails = userService.authenticateUser(loginDTO);
            String jwtToken = jwtService.generateToken(userDetails.getUsername());
            LoginResponseDTO loginResponseDTO = new LoginResponseDTO(jwtToken, jwtService.getExpirationTime());
            return ResponseEntity.ok(loginResponseDTO);
        } catch (UserNotVerifiedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
        catch (UsernameNotFoundException ex){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
        catch (Exception ex){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
        }
    }
}