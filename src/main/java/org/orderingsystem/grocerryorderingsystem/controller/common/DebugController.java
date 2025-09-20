package org.orderingsystem.grocerryorderingsystem.controller.common;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final ProductRepository productRepository;

    @GetMapping("/db-test")
    public String testDatabase() {
        try {
            long count = productRepository.count();
            return "Database connection OK. Total products: " + count;
        } catch (Exception e) {
            return "Database connection FAILED: " + e.getMessage();
        }
    }

    @GetMapping("/sku-test")
    public String testSkuFunction() {
        try {
            // Test if findBySku works
            boolean hasProducts = productRepository.count() > 0;
            if (hasProducts) {
                // Get the first product to test SKU lookup
                var firstProduct = productRepository.findAll().get(0);
                var foundProduct = productRepository.findBySku(firstProduct.getSku());

                if (foundProduct.isPresent()) {
                    return "SKU lookup works! Found product: " + foundProduct.get().getSku();
                } else {
                    return "SKU lookup failed for: " + firstProduct.getSku();
                }
            } else {
                return "No products in database. SKU test not possible.";
            }
        } catch (Exception e) {
            return "SKU test error: " + e.getMessage();
        }
    }
}