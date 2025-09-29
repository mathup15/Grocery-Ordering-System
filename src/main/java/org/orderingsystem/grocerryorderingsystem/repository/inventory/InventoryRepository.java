package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    /**
     * Low stock = (stockOnHand - reservedQty) <= product.reorderPoint
     *
     * We start from Inventory and join to Product (inverse side), which is
     * cleaner now that Product owns the FK and Inventory has "product" mappedBy.
     */
    @Query("""
           select i
             from Inventory i
             join i.product p
            where (coalesce(i.stockOnHand, 0) - coalesce(i.reservedQty, 0))
                  <= coalesce(p.reorderPoint, 0)
           """)
    List<Inventory> findLowStock();
}
