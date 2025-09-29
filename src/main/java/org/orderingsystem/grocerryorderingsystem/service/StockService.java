package org.orderingsystem.grocerryorderingsystem.service;

import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockAdjustment;

import java.util.List;

public interface StockService {
    Product adjustStock(Product product, String adjustmentType, Integer quantity, String reason);
    List<StockAdjustment> getStockHistory(Long productId);
}
