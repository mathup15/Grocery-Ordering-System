package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;

/** Lightweight mappers for API models. */
public final class Dtos {
    private Dtos() {}

    public static ProductResp toResp(Product p) {
        Inventory inv = p.getInventory();
        Integer soh = inv == null ? 0 : nz(inv.getStockOnHand());
        Integer res = inv == null ? 0 : nz(inv.getReservedQty());
        int available = Math.max(0, soh - res);

        return new ProductResp(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getCategory(),
                p.getUnit(),
                p.getPrice(),
                p.getReorderPoint(),
                p.getImageUrl(),
                p.getActive(),
                soh,
                res,
                available
        );
    }

    private static Integer nz(Integer v) { return v == null ? 0 : v; }
}