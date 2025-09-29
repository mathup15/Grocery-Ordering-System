package org.orderingsystem.grocerryorderingsystem.repository.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    Page<Product> findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(String name, String sku, Pageable pageable);

    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    // Distinct active categories for filters
    @Query("select distinct p.category from Product p where p.active = true and p.category is not null order by p.category asc")
    List<String> findActiveCategories();

    // Optional: fast check for “available > 0”
    @Query("""
           select p from Product p
           join p.inventory i
           where (coalesce(i.stockOnHand,0) - coalesce(i.reservedQty,0)) > 0
           """)
    List<Product> findAvailableAny();
}



