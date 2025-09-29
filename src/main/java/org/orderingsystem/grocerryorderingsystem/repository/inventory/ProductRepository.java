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

    @Query("select distinct p.category from Product p where p.active = true and p.category is not null order by p.category asc")
    List<String> findActiveCategories();

    @Query("""
           select p from Product p
           left join fetch p.inventory i
           where (coalesce(i.stockOnHand,0) - coalesce(i.reservedQty,0)) > 0
           """)
    List<Product> findAvailableAny();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.inventory i WHERE p.id = :id")
    Optional<Product> findByIdWithInventory(@Param("id") Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.inventory i WHERE p.id IN :ids")
    List<Product> findAllByIdWithInventory(@Param("ids") List<Long> ids);
}
