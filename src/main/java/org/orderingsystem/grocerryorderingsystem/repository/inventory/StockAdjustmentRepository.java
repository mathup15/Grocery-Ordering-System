package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    /**
     * Return adjustments for a given product and type (ADD/REMOVE/SET),
     * newest first, using the entity field 'createdAt'.
     */
    List<StockAdjustment> findByProductIdAndAdjustmentTypeOrderByCreatedAtDesc(
            Long productId,
            StockAdjustment.AdjustmentType adjustmentType
    );

    /**
     * Return all adjustments for a product, newest first, using 'createdAt'.
     */
    List<StockAdjustment> findByProductIdOrderByCreatedAtDesc(Long productId);
}
