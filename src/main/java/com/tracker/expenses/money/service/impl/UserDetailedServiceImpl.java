package com.tracker.expenses.money.service.impl;

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

    /**
     * @param username
     * @return
     * @throws UsernameNotFoundException
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
