package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.StockAdjustmentRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockAdjustmentRepository stockAdjustmentRepository;

    @Transactional
    public void adjustStock(Product product, String adjustmentType, Integer quantity, String reason) {
        if (product == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        Inventory inventory = product.getInventory();
        if (inventory == null) {
            inventory = Inventory.builder()
                    .stockOnHand(0)
                    .reservedQty(0)
                    .build();
            product.setInventory(inventory);
        }

        int previousStock = inventory.getStockOnHand() != null ? inventory.getStockOnHand() : 0;
        int newStock;

        try {
            StockAdjustment.AdjustmentType type = StockAdjustment.AdjustmentType.valueOf(adjustmentType.toUpperCase());

            switch (type) {
                case ADD:
                    newStock = previousStock + quantity;
                    break;
                case REMOVE:
                    if (quantity > previousStock) {
                        throw new IllegalArgumentException("Cannot remove more stock than available");
                    }
                    newStock = previousStock - quantity;
                    break;
                case SET:
                    if (quantity < 0) {
                        throw new IllegalArgumentException("Stock cannot be negative");
                    }
                    newStock = quantity;
                    break;
                default:
                    throw new IllegalArgumentException("Invalid adjustment type: " + adjustmentType);
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid adjustment type: " + adjustmentType);
        }

        // Update inventory
        inventory.setStockOnHand(newStock);

        // Create stock adjustment record
        String adjustedBy = SecurityContextHolder.getContext().getAuthentication().getName();

        StockAdjustment adjustment = StockAdjustment.builder()
                .product(product)
                .adjustmentType(StockAdjustment.AdjustmentType.valueOf(adjustmentType.toUpperCase()))
                .quantity(quantity)
                .reason(reason)
                .previousStock(previousStock)
                .newStock(newStock)
                .adjustedAt(LocalDateTime.now())
                .adjustedBy(adjustedBy)
                .build();

        stockAdjustmentRepository.save(adjustment);
    }

    public List<StockAdjustment> getStockHistory(Long productId) {
        return stockAdjustmentRepository.findByProductIdOrderByAdjustedAtDesc(productId);
    }
}