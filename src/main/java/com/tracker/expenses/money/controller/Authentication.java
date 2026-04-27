package com.tracker.expenses.money.controller;

import com.tracker.expenses.money.dto.Response;
import com.tracker.expenses.money.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class Authentication {
    public boolean auth(){
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.info("Unable to authenticate the user");
            return false;
        }
        return true;
    }
    public User getCurrentUser(){
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            assert authentication != null;
            log.info("Unable to authenticate the user: {}", authentication.getName());
            return null;
        }
        return (User) authentication.getPrincipal();
    }

    public String getCurrentUserName() {
        org.springframework.security.core.Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.info("Unable to authenticate the user");
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return authentication.getName();
    }
}
