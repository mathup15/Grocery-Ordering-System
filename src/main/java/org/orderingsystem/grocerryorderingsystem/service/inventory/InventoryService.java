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

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

    // --- Fix missing inventory records ---
    @Transactional
    public void createMissingInventoryRecords() {
        List<Product> productsWithoutInventory = products.findAll().stream()
                .filter(p -> p.getInventory() == null)
                .collect(Collectors.toList());

        for (Product product : productsWithoutInventory) {
            Inventory inventory = Inventory.builder()
                    .stockOnHand(0)  // Set initial stock to 0 or your desired value
                    .reservedQty(0)
                    .product(product)
                    .build();
            product.setInventory(inventory);
            products.save(product);
            System.out.println("Created inventory record for product: " + product.getName());
        }

        System.out.println("Created " + productsWithoutInventory.size() + " missing inventory records");
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

    // NEW: Stock adjustment with expiry support
    @Transactional
    public Inventory adjustWithExpiry(Long productId, StockMovement.Type type, int qty,
                                      LocalDate expiryDate, String batchNumber,
                                      String refType, String refId, String actor) {
        if (qty <= 0) throw new IllegalArgumentException("Qty must be > 0");

        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        // Update expiry details if provided
        if (expiryDate != null) {
            inv.setExpiryDate(expiryDate);
        }
        if (batchNumber != null && !batchNumber.trim().isEmpty()) {
            inv.setBatchNumber(batchNumber.trim());
        }

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
                .product(prod)
                .type(type)
                .qty(qty)
                .referenceType(refType)
                .referenceId(refId)
                .createdBy(actor)
                .build());

        return inv;
    }

    // NEW: Update expiry information without changing stock
    @Transactional
    public Inventory updateExpiryInfo(Long productId, LocalDate expiryDate, String batchNumber, String actor) {
        Product prod = products.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));
        Inventory inv = prod.getInventory();
        if (inv == null) throw new IllegalStateException("Inventory row missing for product " + productId);

        if (expiryDate != null) {
            inv.setExpiryDate(expiryDate);
        }
        if (batchNumber != null) {
            inv.setBatchNumber(batchNumber);
        }

        // Create a stock movement record for audit
        movements.save(StockMovement.builder()
                .product(prod)
                .type(StockMovement.Type.ADJUST)
                .qty(0) // No quantity change
                .referenceType("EXPIRY_UPDATE")
                .referenceId("expiry_update_" + System.currentTimeMillis())
                .createdBy(actor)
                .build());

        return inv;
    }

    // NEW: Get expired products
    public List<Inventory> getExpiredProducts() {
        return inventories.findAll().stream()
                .filter(inv -> inv.isExpired())
                .collect(Collectors.toList());
    }

    // NEW: Get products expiring soon (within 30 days)
    public List<Inventory> getProductsExpiringSoon() {
        return inventories.findAll().stream()
                .filter(inv -> inv.expiresSoon())
                .collect(Collectors.toList());
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