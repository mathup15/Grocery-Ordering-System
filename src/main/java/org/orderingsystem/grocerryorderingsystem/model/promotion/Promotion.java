package org.orderingsystem.grocerryorderingsystem.model.promotion;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type;  // PERCENTAGE, FLAT

    @Column(nullable = false)
    private Double value;

    private LocalDate startDate;
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonManagedReference
    private Product product;

    @Column(name = "final_price")
    private Double finalPrice;
}
