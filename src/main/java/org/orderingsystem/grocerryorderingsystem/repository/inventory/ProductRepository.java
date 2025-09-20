package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    Page<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku, Pageable pageable);
    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.inventory.id = :inventoryId")
    Optional<Product> findByInventoryId(Long inventoryId);

    @Query("""
           select p
             from Product p
            where (coalesce(p.inventory.stockOnHand, 0) - coalesce(p.inventory.reservedQty, 0))
                  <= coalesce(p.reorderPoint, 0)
           """)
    Page<Product> findLowStockProducts(Pageable pageable);

    // Debug methods
    @Query("SELECT p FROM Product p WHERE TRIM(p.sku) = TRIM(:sku)")
    Optional<Product> findBySkuTrimmed(@Param("sku") String sku);

    List<Product> findBySkuContainingIgnoreCase(String skuPart);
}