package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.StockAdjustmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final ProductRepository productRepository;
    private final StockAdjustmentRepository adjustmentRepository;

    /**
     * Apply a stock adjustment (ADD, REMOVE, SET) for the given product.
     * Persists product+inventory before logging the adjustment so the FK is valid.
     */
    @Override
    @Transactional
    public Product adjustStock(Product product, String adjustmentType, Integer quantity, String reason) {

        // normalize inputs
        Objects.requireNonNull(product, "product must not be null");
        if (adjustmentType == null) {
            throw new IllegalArgumentException("adjustmentType must not be null (ADD | REMOVE | SET)");
        }
        final int q = Math.max(0, quantity == null ? 0 : quantity);
        final StockAdjustment.AdjustmentType type =
                StockAdjustment.AdjustmentType.valueOf(adjustmentType.toUpperCase().trim());

        // ensure inventory exists
        Inventory inv = product.getInventory();
        if (inv == null) {
            inv = Inventory.builder()
                    .stockOnHand(0)
                    .reservedQty(0)
                    .build();
            inv.setProduct(product);
            product.setInventory(inv);
        }

        // current stock and apply change
        final int current = inv.getStockOnHand() == null ? 0 : inv.getStockOnHand();
        switch (type) {
            case ADD -> inv.setStockOnHand(current + q);
            case REMOVE -> inv.setStockOnHand(Math.max(0, current - q));
            case SET -> inv.setStockOnHand(q);
        }

        // persist product (and cascaded inventory if configured)
        product = productRepository.save(product);

        // log the adjustment (createdAt auto-filled via @CreationTimestamp)
        StockAdjustment adj = StockAdjustment.builder()
                .product(product)
                .adjustmentType(type)
                .quantity(q)
                .reason(reason)
                .build();
        adjustmentRepository.save(adj);

        return product;
    }

    /**
     * Override required by StockService interface.
     * Returns newest-first history of ALL adjustments for a product.
     */
    @Override
    @Transactional(readOnly = true)
    public List<StockAdjustment> getStockHistory(Long productId) {
        Objects.requireNonNull(productId, "productId must not be null");
        return adjustmentRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    /**
     * Extra helper (not in interface): filter by adjustment type.
     */
    @Transactional(readOnly = true)
    public List<StockAdjustment> getStockHistory(
            Long productId,
            StockAdjustment.AdjustmentType type
    ) {
        Objects.requireNonNull(productId, "productId must not be null");
        Objects.requireNonNull(type, "type must not be null");
        return adjustmentRepository.findByProductIdAndAdjustmentTypeOrderByCreatedAtDesc(productId, type);
    }
}
