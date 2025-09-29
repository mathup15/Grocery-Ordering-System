package org.orderingsystem.grocerryorderingsystem.model.inventory;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String category;
    private String unit;

    private String brand;
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private Integer reorderPoint;
    private Integer reorderQuantity;

    private String imageUrl;

    @Builder.Default
    private Boolean active = true;

    // Product OWNS the relation (FK products.inventory_id)
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    @JsonIgnore
    private Inventory inventory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StockAdjustment> stockAdjustments;

    @Transient
    public Integer getStockQuantity() {
        return inventory != null ? inventory.getStockOnHand() : 0;
    }

    @Transient
    public Integer getAvailableStock() {
        if (inventory == null) return 0;
        int soh = inventory.getStockOnHand() != null ? inventory.getStockOnHand() : 0;
        int res = inventory.getReservedQty() != null ? inventory.getReservedQty() : 0;
        return Math.max(0, soh - res);
    }

    @Transient
    public Boolean getInStock() {
        return getAvailableStock() > 0;
    }
    // Explicit getters (Lombok's @Data should generate these, but adding for clarity)
    public Long getId() { return id; }
    public String getSku() { return sku; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getUnit() { return unit; }
    public Double getPrice() { return price; }
    public Integer getReorderPoint() { return reorderPoint; }
    public String getImageUrl() { return imageUrl; }
    public Boolean getActive() { return active; }
    public Inventory getInventory() { return inventory; }
    public List<StockAdjustment> getStockAdjustments() { return stockAdjustments; }
}
