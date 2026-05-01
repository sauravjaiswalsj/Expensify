package com.tracker.expenses.money.service.impl;

import com.tracker.expenses.money.dto.userdto.LoginDTO;
import com.tracker.expenses.money.dto.userdto.UserDTO;
import com.tracker.expenses.money.enums.Role;
import com.tracker.expenses.money.exception.UserNotVerifiedException;
import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.UserRepository;
import com.tracker.expenses.money.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void authenticateUserAcceptsBcryptPassword() {
        User user = verifiedUser();
        user.setUsername("codex");
        user.setPassword("$2a$10$encoded");
        when(userRepository.findByUsername("codex")).thenReturn(user);
        when(passwordEncoder.matches("StrongP@ss1", "$2a$10$encoded")).thenReturn(true);

        UserDTO result = userService.authenticateUser(login(" CoDeX ", "StrongP@ss1"));

        assertEquals("codex", result.getUsername());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUserMigratesLegacyPlaintextPassword() {
        User user = verifiedUser();
        user.setUsername("codex");
        user.setPassword("StrongP@ss1");
        when(userRepository.findByUsername("codex")).thenReturn(user);
        when(passwordEncoder.encode("StrongP@ss1")).thenReturn("$2a$10$migrated");

        UserDTO result = userService.authenticateUser(login("codex", "StrongP@ss1"));

        assertEquals("codex", result.getUsername());
        assertEquals("$2a$10$migrated", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void authenticateUserRejectsWrongPassword() {
        User user = verifiedUser();
        user.setPassword("$2a$10$encoded");
        when(userRepository.findByUsername("codex")).thenReturn(user);
        when(passwordEncoder.matches("wrong", "$2a$10$encoded")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.authenticateUser(login("codex", "wrong")));
    }

    @Test
    void authenticateUserRejectsUnverifiedUserAfterPasswordMatch() {
        User user = verifiedUser();
        user.setAccountVerified(false);
        user.setPassword("$2a$10$encoded");
        when(userRepository.findByUsername("codex")).thenReturn(user);
        when(passwordEncoder.matches("StrongP@ss1", "$2a$10$encoded")).thenReturn(true);

        assertThrows(UserNotVerifiedException.class,
                () -> userService.authenticateUser(login("codex", "StrongP@ss1")));
    }

    @Test
    void authenticateUserRejectsMissingUser() {
        when(userRepository.findByUsername("codex")).thenReturn(null);
        when(userRepository.findByUsernameIgnoreCase("codex")).thenReturn(null);

        assertThrows(UsernameNotFoundException.class,
                () -> userService.authenticateUser(login("codex", "StrongP@ss1")));
    }

    @Test
    void authenticateUserPrefersExactLowercaseUsernameOverIgnoreCaseMatch() {
        User lowercaseUser = verifiedUser();
        lowercaseUser.setUsername("codex");
        lowercaseUser.setPassword("$2a$10$correct");

        when(userRepository.findByUsername("codex")).thenReturn(lowercaseUser);
        when(passwordEncoder.matches("StrongP@ss1", "$2a$10$correct")).thenReturn(true);

        UserDTO result = userService.authenticateUser(login("codex", "StrongP@ss1"));

        assertEquals("codex", result.getUsername());
    }

    private User verifiedUser() {
        User user = new User();
        user.setUsername("codex");
        user.setFirstName("Code");
        user.setLastName("Ex");
        user.setEmail("codex@example.com");
        user.setRole(Role.USER);
        user.setAccountVerified(true);
        return user;
    }

    private LoginDTO login(String username, String password) {
        LoginDTO loginDTO = new LoginDTO();
        loginDTO.setUsername(username);
        loginDTO.setPassword(password);
        return loginDTO;
    }
}
