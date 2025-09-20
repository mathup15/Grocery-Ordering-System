package org.orderingsystem.grocerryorderingsystem.repository;

import java.util.Optional;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUniqueId(String uniqueId);
    Optional<User> findByUsername(String username);
}