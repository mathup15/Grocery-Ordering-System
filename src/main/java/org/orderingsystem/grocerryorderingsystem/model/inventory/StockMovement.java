package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity @Table(name="stock_movements", indexes = {
        @Index(name="idx_movement_product_time", columnList = "product_id, createdAt DESC")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {
    public enum Type { IN, OUT, ADJUST, RESERVE, RELEASE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false) @JoinColumn(name="product_id")
    private Product product;

    @Enumerated(EnumType.STRING) @Column(length=16, nullable=false)
    private Type type;

    @Column(nullable=false) private Integer qty;  // positive
    private String referenceType;                 // ORDER, MANUAL, CSV, PO...
    private String referenceId;
    @Column(nullable=false) private Instant createdAt = Instant.now();
    private String createdBy; // staff uniqueId
}
