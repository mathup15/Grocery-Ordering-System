package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final ProductRepository productRepository;

    @PostMapping("/{productId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<?> adjustStock(
            @PathVariable Long productId,
            @RequestBody StockAdjustmentRequest request) {

        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));

            stockService.adjustStock(product, request.adjustmentType(),
                    request.quantity(), request.reason());

            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{productId}/history")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public List<StockAdjustment> getStockHistory(@PathVariable Long productId) {
        return stockService.getStockHistory(productId);
    }

    public record StockAdjustmentRequest(
            String adjustmentType, // ADD, REMOVE, SET
            Integer quantity,
            String reason
    ) {}
}