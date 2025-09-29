package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.StockMovement;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    Page<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
}
