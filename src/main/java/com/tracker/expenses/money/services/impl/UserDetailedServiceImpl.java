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
     * Retrieves a user entity by username, assigns an appropriate authority based on the user's role (defaulting to "ROLE_USER" if no role is set), and constructs a Spring Security UserDetails object for authentication.
     *
     * @param username the username identifying the user whose data is to be loaded
     * @return a UserDetails object containing the user's credentials and authorities
     * @throws UsernameNotFoundException if no user with the given username is found
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
