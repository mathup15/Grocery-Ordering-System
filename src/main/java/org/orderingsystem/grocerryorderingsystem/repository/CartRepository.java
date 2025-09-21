
// CartRepository.java
package org.orderingsystem.grocerryorderingsystem.repository;

import org.orderingsystem.grocerryorderingsystem.model.Cart;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
    Optional<Cart> findByUserId(Long userId);
}

