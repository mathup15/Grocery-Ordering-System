package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final ProductRepository products;

    @PostMapping("/{productId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<StockUpdateResp> adjustStock(
            @PathVariable Long productId,
            @RequestBody StockAdjustmentRequest request
    ) {
        Product product = products.findByIdWithInventory(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Product saved = stockService.adjustStock(
                product,
                request.adjustmentType(),
                request.quantity(),
                request.reason()
        );

        Inventory inv = saved.getInventory();
        int soh = inv != null && inv.getStockOnHand() != null ? inv.getStockOnHand() : 0;
        int res = inv != null && inv.getReservedQty() != null ? inv.getReservedQty() : 0;
        int avail = Math.max(0, soh - res);

        return ResponseEntity.ok(new StockUpdateResp(soh, res, avail));
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

    public record StockUpdateResp(
            Integer stockOnHand,
            Integer reservedQty,
            Integer availableQty
    ) {}
}
