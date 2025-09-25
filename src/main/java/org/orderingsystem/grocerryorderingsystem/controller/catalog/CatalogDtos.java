package org.orderingsystem.grocerryorderingsystem.controller.catalog;

import java.util.List;

public class CatalogDtos {

    public record ProductCardView(
            Long id, String sku, String name,
            String category, String unit,
            Double price, String imageUrl,
            Integer availableQty, Boolean inStock
    ) {}

    public record ProductDetailView(
            Long id, String sku, String name,
            String category, String unit,
            Double price, String imageUrl,
            Integer stockOnHand, Integer reservedQty, Integer availableQty
    ) {}

    public record PageView<T>(List<T> items, long total) {}
}
