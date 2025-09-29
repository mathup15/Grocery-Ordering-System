package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "inventory")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private Integer stockOnHand = 0;

    @Builder.Default
    private Integer reservedQty = 0;

    // Expiry for the current batch
    private LocalDate expiryDate;

    @Column(name = "batch_number")
    private String batchNumber;

    /** Inverse side — Product owns the FK (products.inventory_id) */
    @OneToOne(mappedBy = "inventory")
    private Product product;

    /* --------- Derived helpers (not persisted) --------- */

    @Transient
    public int available() {
        int soh = stockOnHand == null ? 0 : stockOnHand;
        int res = reservedQty == null ? 0 : reservedQty;
        return Math.max(0, soh - res);
    }

    @Transient
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    @Transient
    public boolean expiresSoon() {
        if (expiryDate == null) return false;
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return !expiryDate.isBefore(LocalDate.now()) && expiryDate.isBefore(thirtyDaysFromNow);
    }

    @Transient
    public long getDaysUntilExpiry() {
        if (expiryDate == null) return Long.MAX_VALUE;
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
    }

    @Transient
    public String getExpiryStatus() {
        if (expiryDate == null) return "NO_EXPIRY";
        if (isExpired()) return "EXPIRED";
        if (expiresSoon()) return "EXPIRES_SOON";
        return "OK";
    }
}
