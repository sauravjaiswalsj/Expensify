package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.dto.userDTO.PasswordResetDTO;
import com.tracker.expenses.money.enums.Role;
import com.tracker.expenses.money.services.UserService;
import com.tracker.expenses.money.services.business.UserServiceBusiness;
import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.dto.ResponseHeader;
import com.tracker.expenses.money.exception.IncorrectPasswordException;
import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserLength;
import com.tracker.expenses.money.exception.UserAlreadyExistsException;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserServiceBusiness userServiceBusiness;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private void isUserValid(User user){
        String username = user.getUsername().toLowerCase();
        userServiceBusiness.isUsernameValid(username);
        if(userRepository.findByUsername(username)!=null){
            throw new UserAlreadyExistsException("User already exists "+username);
        }
        userServiceBusiness.isEmailValid(user.getEmail());
    }

    public User findByUsername(String username) {
        username = username.toLowerCase();
        return  userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        email = email.toLowerCase();
        return userRepository.findByEmail(email);
    }

    public Response<ResponseHeader, User> addUser(User user){
        try{
            isUserValid(user);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setRole(Role.USER);
            User res =  userRepository.save(user);

            return new Response<>(new ResponseHeader(HttpStatus.CREATED, "User created successfully"), res);

        }catch (UserAlreadyExistsException e){
            return new Response<>(new ResponseHeader(HttpStatus.CONFLICT, e.getMessage()), user);
        }catch (InvalidUserLength | InvalidEmailException ex){
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, ex.getMessage()), user);
        } catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), user);
        }
    }

    public List<User> findAll(){
        return userRepository.findAll();
    }

    public Response<ResponseHeader, User> verifyUser(User user){
        try{
             User res = findByUsername(user.getUsername());
             if (res == null){
                 throw new UsernameNotFoundException("User does not exist");
             }

             if (!res.getPassword().equals(user.getPassword())){
                 throw new IncorrectPasswordException("Password is wrong");
             }
             return new Response<>(new ResponseHeader(HttpStatus.OK, "User verified successfully"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), user);
        }catch (IncorrectPasswordException ex){
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, ex.getMessage()), user);
        }catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), user);
        }
    }

    public Response<ResponseHeader, User> updatePassword(PasswordResetDTO passwordResetDTO){
        User userdata = null;
        try{
            userdata = findByUsername(passwordResetDTO.getUsername());
            if (userdata == null){
                throw new UsernameNotFoundException("User does not exist");
            }
            userdata.setPassword(passwordEncoder.encode(passwordResetDTO.getPassword()));
            var res = userRepository.save(userdata);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "Password successfully reset"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), userdata);
        }
        catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), userdata);
        }
    }

    public Response<ResponseHeader, User> updateUser(User user){
        try{
            User userdata = findByUsername(user.getUsername());
            if (userdata == null){
                throw new UsernameNotFoundException("User does not exist");
            }
            if (user.getEmail() != null){
                userServiceBusiness.isEmailValid(user.getEmail());
                userdata.setEmail(user.getEmail());
            }
            if (user.getPassword() != null){
                userdata.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            var res = userRepository.save(userdata);
            return new Response<>(new ResponseHeader(HttpStatus.OK, "User successfully updated"), res);
        }catch (UsernameNotFoundException ex){
            return new Response<>(new ResponseHeader(HttpStatus.NOT_FOUND, ex.getMessage()), user);
        }catch (InvalidEmailException ex){
            return new Response<>(new ResponseHeader(HttpStatus.BAD_REQUEST, ex.getMessage()), user);
        }catch (Exception ex){
            return new Response<>(new ResponseHeader(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()), user);
        }
    }
}
