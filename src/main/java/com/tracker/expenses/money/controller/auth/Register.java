package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserException;
import com.tracker.expenses.money.exception.InvalidUserLengthException;
import com.tracker.expenses.money.exception.UserAlreadyExistsException;
import com.tracker.expenses.money.service.UserService;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.User;
import jakarta.validation.Valid;
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
    public ResponseEntity<Response> register(@Valid @RequestBody UserDTO user) {
        try{
            var response = userService.addUser(user);
            var httpResponseStatus = response.getHeader().getHttpResponseStatus();
            int code = httpResponseStatus.value();
            return ResponseEntity.status(code).body(response);

        }catch (InvalidUserException | InvalidUserLengthException |
                InvalidEmailException ex){
            return ResponseEntity.status(400).body(new Response(false, ex.getMessage()));
        }
        catch (UserAlreadyExistsException e){
            return ResponseEntity.status(409).body(new Response(false, "CONFLICT user already exists."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new Response(false, "Internal Server Error"));
        }

    }
}
