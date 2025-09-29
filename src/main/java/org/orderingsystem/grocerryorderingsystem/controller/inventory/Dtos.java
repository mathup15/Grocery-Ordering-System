package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;

public final class Dtos {
    private Dtos() {}

    public static ProductResp toResp(Product p) {
        Inventory inv = p.getInventory();
        Long invId = inv != null ? inv.getId() : null;

        int soh = inv == null || inv.getStockOnHand() == null ? 0 : inv.getStockOnHand();
        int res = inv == null || inv.getReservedQty() == null ? 0 : inv.getReservedQty();
        int avail = Math.max(0, soh - res);

        return ProductResp.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .category(p.getCategory())
                .unit(p.getUnit())
                .price(p.getPrice())
                .reorderPoint(p.getReorderPoint())
                .reorderQuantity(p.getReorderQuantity())
                .imageUrl(p.getImageUrl())
                .active(p.getActive())

                .inventoryId(invId)
                .stockOnHand(soh)
                .reservedQty(res)
                .availableQty(avail)

                .brand(p.getBrand())
                .description(p.getDescription())
                .expiryDate(inv != null && inv.getExpiryDate() != null ? inv.getExpiryDate().toString() : null)
                .build();
    }
}
