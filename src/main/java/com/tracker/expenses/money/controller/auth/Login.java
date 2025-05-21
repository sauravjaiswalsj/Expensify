package com.tracker.expenses.money.controller.auth;

import com.tracker.expenses.money.controller.Authentication;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.dto.mapper.LoginDTOMapper;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost3000/",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowCredentials = "true"
)
@Slf4j
public class Login {
    @Autowired
    private UserService userService;

    @Autowired
    private LoginDTOMapper loginDTOMapper;
    @Autowired
    private Authentication authentication;
    @PostMapping("/login")
    public ResponseEntity<Response> login(){
        if (!authentication.auth())
            return ResponseEntity.status(401).body(new Response(false, "User Not Authenticated"));

        return ResponseEntity.status(200).body(new Response(true, "User Authenticated"));
    }


//    @PostMapping("/login")
//    public ResponseEntity<Response> login(@RequestBody LoginDTO loginDTO) {
//        // map loginDTO to UserDto
//        User user = loginDTOMapper.setLoginDTO(loginDTO);
//        if (user == null) {
//            return ResponseEntity.status(402).body(new Response(false, "Username or Email address is empty"));
//        }
//        Response<ResponseHeader,LoginDTO> res = retrieveLoginDTO(user);
//        var httpStatus = res.getHeader().getHttpResponseStatus();
//
//        return ResponseEntity.status(httpStatus.value()).body(res);
//    }

    private Response retrieveLoginDTO(User user) {
        Response<ResponseHeader,User> res = userService.verifyUser(user);
        ResponseHeader header = res.getHeader();
        HttpStatus httpResponseStatus = header.getHttpResponseStatus();
        String msg = header.getResponseMessage();

        var loginDTOResponse = loginDTOMapper.retriveLoginDTO(res.getMethodBody());
        return new Response<>(new ResponseHeader(httpResponseStatus, msg), loginDTOResponse);
    }
}
