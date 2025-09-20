package org.orderingsystem.grocerryorderingsystem.controller.inventory;

public record ProductResp(
        Long id,
        String sku,
        String name,
        String category,
        String unit,
        Double price,
        Integer reorderPoint,
        String imageUrl,
        Boolean active,
        Integer stockOnHand,
        Integer reservedQty,
        Integer availableQty
) {}
