package org.orderingsystem.grocerryorderingsystem.controller.promotion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private Long id;
    private String title;
    private String type;
    private Double value;
    private String startDate;
    private String endDate;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Double productPrice;
    private Double finalAmount;
}

