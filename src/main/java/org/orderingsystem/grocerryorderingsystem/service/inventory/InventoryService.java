package org.orderingsystem.grocerryorderingsystem.service.inventory;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockMovement;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.InventoryRepository;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository products;
    private final InventoryRepository inventories;
    private final StockMovementRepository movements;

    // --- Product CRUD ---
    @Transactional
    public Product create(Product p) {
        products.findBySku(p.getSku()).ifPresent(x -> {
            throw new IllegalArgumentException("SKU already exists");
        });

        // ensure an Inventory row exists (set from Product side)
        if (p.getInventory() == null) {
            Inventory inv = Inventory.builder()
                    .stockOnHand(0)
                    .reservedQty(0)
                    .product(p) // Set the bidirectional relationship
                    .build();
            p.setInventory(inv); // Product owns the relation (cascade = ALL)
        }

        return products.save(p);
    }

    @Transactional
    public Product update(Long id, Product patch) {
        Product p = products.findById(id).orElseThrow(() ->
                new IllegalArgumentException("Product not found with id: " + id));
        p.setName(patch.getName());
        p.setCategory(patch.getCategory());
        p.setUnit(patch.getUnit());
        p.setPrice(patch.getPrice());
        p.setReorderPoint(patch.getReorderPoint());
        p.setImageUrl(patch.getImageUrl());
        p.setActive(patch.getActive() == null ? Boolean.TRUE : patch.getActive());

        // make sure inventory still exists
        if (p.getInventory() == null) {
            Inventory inv = Inventory.builder()
                    .stockOnHand(0)
                    .reservedQty(0)
                    .product(p)
                    .build();
            p.setInventory(inv);
        }
        return p; // JPA will flush changes
    }

    // --- Stock Adjustments (staff actions) ---
    @Transactional
    public Inventory adjust(Long productId, StockMovement.Type type, int qty, String refType, String refId, String actor) {
        if (qty <= 0) throw new IllegalArgumentException("Qty must be > 0");

        // get inventory via Product (since Inventory has no product field)
        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        switch (type) {
            case IN -> inv.setStockOnHand(inv.getStockOnHand() + qty);
            case OUT, ADJUST -> {
                int newSoH = inv.getStockOnHand() - qty;
                if (newSoH < 0) throw new IllegalStateException("Insufficient stock");
                inv.setStockOnHand(newSoH);
            }
            default -> throw new IllegalArgumentException("Use reserve/commit/release for orders");
        }

        movements.save(StockMovement.builder()
                .product(prod)                // use the Product we loaded
                .type(type)
                .qty(qty)
                .referenceType(refType)
                .referenceId(refId)
                .createdBy(actor)
                .build());

        return inv;
    }

    // --- Checkout-safe flow (reserve/commit/release) ---
    @Transactional
    public void reserve(Long productId, int qty, String orderId, String actor) {
        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        if (qty <= 0 || qty > available(inv)) throw new IllegalStateException("Not enough available stock");
        inv.setReservedQty(inv.getReservedQty() + qty);

        movements.save(StockMovement.builder()
                .product(prod)
                .type(StockMovement.Type.RESERVE)
                .qty(qty)
                .referenceType("ORDER")
                .referenceId(orderId)
                .createdBy(actor)
                .build());
    }

    @Transactional
    public void commit(Long productId, int qty, String orderId, String actor) {
        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        if (qty <= 0 || qty > inv.getReservedQty()) throw new IllegalStateException("Not enough reserved");
        inv.setReservedQty(inv.getReservedQty() - qty);
        inv.setStockOnHand(inv.getStockOnHand() - qty);

        movements.save(StockMovement.builder()
                .product(prod)
                .type(StockMovement.Type.OUT)
                .qty(qty)
                .referenceType("ORDER")
                .referenceId(orderId)
                .createdBy(actor)
                .build());
    }

    @Transactional
    public void release(Long productId, int qty, String orderId, String actor) {
        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        if (qty <= 0 || qty > inv.getReservedQty()) throw new IllegalStateException("Not enough reserved");
        inv.setReservedQty(inv.getReservedQty() - qty);

        movements.save(StockMovement.builder()
                .product(prod)
                .type(StockMovement.Type.RELEASE)
                .qty(qty)
                .referenceType("ORDER")
                .referenceId(orderId)
                .createdBy(actor)
                .build());
    }

    public List<Inventory> lowStock() {
        return inventories.findLowStock();
    }

    private int available(Inventory inv) {
        int soh = inv.getStockOnHand() == null ? 0 : inv.getStockOnHand();
        int res = inv.getReservedQty() == null ? 0 : inv.getReservedQty();
        return Math.max(0, soh - res);
    }
}