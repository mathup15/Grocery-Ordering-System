package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private Integer stockOnHand = 0;

    @Builder.Default
    private Integer reservedQty = 0;

    /** Bidirectional side is optional but handy for queries/mapping */
    @OneToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Transient
    public int available() {
        int soh = stockOnHand == null ? 0 : stockOnHand;
        int res = reservedQty == null ? 0 : reservedQty;
        return Math.max(0, soh - res);
    }
}