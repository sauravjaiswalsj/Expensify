package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUser;
import com.tracker.expenses.money.exception.InvalidUserLength;
import com.tracker.expenses.money.exception.UserAlreadyExistsException;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/auth")
@RestController
public class Register {
    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public List<User> getUser() {
        return userService.findAll();
    }

    @PostMapping("/signup")
    public ResponseEntity<Response> register(@RequestBody UserDTO user) {
        try{
            if (user == null) {
                throw new InvalidUser("User is empty");
            }
            if (user.getUsername() == null || user.getUsername().isEmpty()) {
                throw new InvalidUser("Username is empty");
            }
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                throw new InvalidEmailException("Email is empty");
            }
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                throw new InvalidUser("Password is empty");
            }

            var response = userService.addUser(user);
            var httpResponseStatus = response.getHeader().getHttpResponseStatus();
            int code = httpResponseStatus.value();
            return ResponseEntity.status(code).body(response);

        }catch (UserAlreadyExistsException e){
            return ResponseEntity.status(409).body(new Response(false, "CONFLICT user already exists."));
        }catch (InvalidUser | InvalidUserLength | InvalidEmailException ex){
            return ResponseEntity.status(400).body(new Response(false, "BAD REQUEST user length or email is invalid."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Response(false, "Internal Server Error"));
        }

    }
}
