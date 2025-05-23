package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.dto.userDTO.LoginDTO;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.services.AuthenticationService;
import com.tracker.expenses.money.services.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserDetailedServiceImpl userDetailedServiceImpl;
    @Autowired
    private EmailService emailService;

    @Override
    public UserDetails authenticateUser(LoginDTO loginDTO) {
        try{
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    loginDTO.getUsername(), loginDTO.getPassword()));

            log.info("User {} authenticated successfully", loginDTO.getUsername());
            return userDetailedServiceImpl.loadUserByUsername(loginDTO.getUsername());
        }catch(BadCredentialsException e){
            log.error("Bad credentials for user {}", loginDTO.getUsername());
            throw new BadCredentialsException("Invalid credentials");
        }
        catch (UsernameNotFoundException e) {
            log.error("User not found: {}", loginDTO.getUsername());
            throw new UsernameNotFoundException("User not found");
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
            throw new AuthenticationException("Authentication failed") {};
        }
    }
}
