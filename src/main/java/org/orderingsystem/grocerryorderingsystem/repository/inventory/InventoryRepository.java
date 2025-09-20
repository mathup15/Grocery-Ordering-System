package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("""
           select i
             from Product p
             join p.inventory i
            where (coalesce(i.stockOnHand, 0) - coalesce(i.reservedQty, 0))
                  <= coalesce(p.reorderPoint, 0)
           """)
    List<Inventory> findLowStock();
}