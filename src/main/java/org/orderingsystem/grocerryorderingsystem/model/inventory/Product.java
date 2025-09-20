package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "products")
@Data // This annotation generates getters, setters, toString, equals, and hashCode
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String category;
    private String unit;

    @Column(nullable = false)
    private Double price;

    private Integer reorderPoint;
    private String imageUrl;

    @Builder.Default
    private Boolean active = true;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StockAdjustment> stockAdjustments;

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