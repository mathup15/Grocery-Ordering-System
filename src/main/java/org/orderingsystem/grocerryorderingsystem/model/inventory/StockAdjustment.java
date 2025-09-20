package org.orderingsystem.grocerryorderingsystem.model.inventory;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustment {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "product_id", nullable = false)
   private Product product;

   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private AdjustmentType adjustmentType;

   @Column(nullable = false)
   private Integer quantity;

   private String reason;

   @Column(nullable = false)
   private Integer previousStock;

   @Column(nullable = false)
   private Integer newStock;

   @Column(nullable = false)
   private LocalDateTime adjustedAt;

   @Column(nullable = false)
   private String adjustedBy;

   public enum AdjustmentType {
      ADD, REMOVE, SET
   }
}