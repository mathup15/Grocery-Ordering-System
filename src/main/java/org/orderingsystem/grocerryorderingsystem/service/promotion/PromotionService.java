package org.orderingsystem.grocerryorderingsystem.service.promotion;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.promotion.Promotion;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.repository.promotion.PromotionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepo;
    private final ProductRepository productRepo;

    public PromotionService(PromotionRepository promotionRepo, ProductRepository productRepo) {
        this.promotionRepo = promotionRepo;
        this.productRepo = productRepo;
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepo.findAll();
    }

    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepo.findById(id);
    }

    public Promotion addPromotion(Promotion promotion, Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        promotion.setProduct(product);
        // Calculate and set finalPrice
        double originalPrice = product.getPrice();
        double finalPrice;
        if ("PERCENTAGE".equalsIgnoreCase(promotion.getType())) {
            finalPrice = originalPrice - (originalPrice * (promotion.getValue() / 100.0));
        } else if ("FLAT".equalsIgnoreCase(promotion.getType())) {
            finalPrice = originalPrice - promotion.getValue();
        } else {
            finalPrice = originalPrice;
        }
        promotion.setFinalPrice(Math.max(finalPrice, 0));
        return promotionRepo.save(promotion);
    }

    public void deletePromotion(Long id) {
        promotionRepo.deleteById(id);
    }

    // **Update promotion**
    public Promotion updatePromotion(Long id, Promotion updated, Long productId) {
        Promotion existing = promotionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        existing.setTitle(updated.getTitle());
        existing.setType(updated.getType());
        existing.setValue(updated.getValue());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setProduct(product);
        // Calculate and set finalPrice
        double originalPrice = product.getPrice();
        double finalPrice;
        if ("PERCENTAGE".equalsIgnoreCase(existing.getType())) {
            finalPrice = originalPrice - (originalPrice * (existing.getValue() / 100.0));
        } else if ("FLAT".equalsIgnoreCase(existing.getType())) {
            finalPrice = originalPrice - existing.getValue();
        } else {
            finalPrice = originalPrice;
        }
        existing.setFinalPrice(Math.max(finalPrice, 0));
        return promotionRepo.save(existing);
    }

    public void recalculateAllFinalPrices() {
        List<Promotion> promotions = promotionRepo.findAll();
        for (Promotion promo : promotions) {
            Product product = promo.getProduct();
            if (product == null) continue;
            double originalPrice = product.getPrice();
            double finalPrice;
            if ("PERCENTAGE".equalsIgnoreCase(promo.getType())) {
                finalPrice = originalPrice - (originalPrice * (promo.getValue() / 100.0));
            } else if ("FLAT".equalsIgnoreCase(promo.getType())) {
                finalPrice = originalPrice - promo.getValue();
            } else {
                finalPrice = originalPrice;
            }
            promo.setFinalPrice(Math.max(finalPrice, 0));
            promotionRepo.save(promo);
        }
    }
}
