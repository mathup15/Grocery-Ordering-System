package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import lombok.Builder;

@Builder
public record ProductResp(
        Long id,
        String sku,
        String name,
        String category,
        String unit,
        Double price,
        Integer reorderPoint,
        Integer reorderQuantity,
        String imageUrl,
        Boolean active,

        // inventory
        Long inventoryId,
        Integer stockOnHand,
        Integer reservedQty,
        Integer availableQty,

        // extras
        String brand,
        String description,
        String expiryDate // yyyy-MM-dd or null
) {}
