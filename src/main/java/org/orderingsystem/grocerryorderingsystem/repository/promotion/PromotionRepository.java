package org.orderingsystem.grocerryorderingsystem.repository.promotion;



import org.orderingsystem.grocerryorderingsystem.model.promotion.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    List<Promotion> findByProductId(Long productId);
}
