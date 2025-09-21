package org.orderingsystem.grocerryorderingsystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    private String category;
    private String imageUrl;
    private String brand;
    private Boolean isOrganic;
    private Boolean isGlutenFree;
    private Double weight;
    private String unit; // kg, g, litre, ml, piece

    @Column(nullable = false)
    private Boolean isActive = true;
}