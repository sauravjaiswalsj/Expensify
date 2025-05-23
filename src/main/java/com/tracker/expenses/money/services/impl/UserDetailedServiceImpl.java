package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.model.User;
import com.tracker.expenses.money.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailedServiceImpl implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    /****
     * Loads user-specific data for authentication based on the provided username.
     *
     * Retrieves user details from the repository and constructs a Spring Security {@link UserDetails} object.
     * If the user is not found, a {@link UsernameNotFoundException} is thrown.
     * Assigns a default authority of "ROLE_USER" if the user's role is missing; otherwise, uses the user's actual role.
     *
     * @param username the username identifying the user whose data is required
     * @return a fully populated {@link UserDetails} object for authentication
     * @throws UsernameNotFoundException if no user is found with the given username
     */

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException(username);
        }
        SimpleGrantedAuthority authority;
        if (user.getRole() == null)
                authority = new SimpleGrantedAuthority("ROLE_USER");
        else
            authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authority)
                .build();
    }
}
