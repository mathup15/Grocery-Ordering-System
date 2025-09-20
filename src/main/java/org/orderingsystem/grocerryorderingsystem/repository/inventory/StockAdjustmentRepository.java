package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findByProductIdOrderByAdjustedAtDesc(Long productId);
    List<StockAdjustment> findByProductIdAndAdjustmentTypeOrderByAdjustedAtDesc(Long productId, StockAdjustment.AdjustmentType type);
}