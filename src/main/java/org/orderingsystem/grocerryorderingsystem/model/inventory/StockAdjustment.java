package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockAdjustment {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   // Many adjustments belong to one product
   @ManyToOne(fetch = FetchType.LAZY, optional = false)
   @JoinColumn(name = "product_id", nullable = false)
   private Product product;

   @Enumerated(EnumType.STRING)
   @Column(name = "adjustment_type", nullable = false, length = 10)
   private AdjustmentType adjustmentType; // ADD, REMOVE, SET

   @Column(nullable = false)
   private Integer quantity;

   @Column(length = 255)
   private String reason;

   // Auto timestamp; no setter required
   @CreationTimestamp
   @Column(name = "created_at", updatable = false)
   private LocalDateTime createdAt;

   public enum AdjustmentType { ADD, REMOVE, SET }
}
