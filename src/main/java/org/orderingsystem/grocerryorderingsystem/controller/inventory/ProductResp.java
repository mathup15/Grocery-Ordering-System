package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductResp {
    private Long id;
    private String sku;
    private String name;
    private String category;
    private String unit;
    private Double price;
    private Integer reorderPoint;
    private String imageUrl;
    private Boolean active;
    private Integer stockOnHand;
    private Integer reservedQty;
    private Integer availableQty;
}
