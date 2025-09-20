package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.orderingsystem.grocerryorderingsystem.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = repo.findByUniqueId(identifier)
                .or(() -> repo.findByUsername(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUniqueId())   // principal = uniqueId
                .password(user.getPasswordHash())   // BCrypt hash
                .roles(user.getRole().name())
                .build();
    }
}