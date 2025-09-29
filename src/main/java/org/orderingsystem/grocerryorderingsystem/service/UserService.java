package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.orderingsystem.grocerryorderingsystem.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
class UserService {
    private final UserRepository repo;
    private final PasswordEncoder encoder;

    /** Login with uniqueId or username; returns user if password matches. */
    public Optional<User> login(String identifier, String rawPassword) {
        return repo.findByUniqueId(identifier)
                .or(() -> repo.findByUsername(identifier))
                .filter(u -> encoder.matches(rawPassword, u.getPasswordHash()));
    }
}