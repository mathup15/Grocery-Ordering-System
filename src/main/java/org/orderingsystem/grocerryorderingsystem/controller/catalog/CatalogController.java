package org.orderingsystem.grocerryorderingsystem.controller.catalog;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.search.ProductSpecs;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.orderingsystem.grocerryorderingsystem.controller.catalog.CatalogDtos.*;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final ProductRepository products;

    // GET /api/catalog/categories
    @GetMapping("/categories")
    public List<String> categories() {
        return products.findActiveCategories();
    }

    // GET /api/catalog/products
    @GetMapping("/products")
    public PageView<ProductCardView> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, name = "inStock") Boolean inStock,
            @RequestParam(defaultValue = "name") String sort
    ) {
        // sort: name | price_asc | price_desc | newest
        Sort s = switch (sort) {
            case "price", "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "new", "newest" -> Sort.by(Sort.Direction.DESC, "id");
            default -> Sort.by(Sort.Direction.ASC, "name");
        };
        Pageable pageable = PageRequest.of(page, size, s);

        // First get the product IDs with pagination and filtering
        Specification<Product> idSpec = Specification
                .where(ProductSpecs.activeTrue())
                .and(ProductSpecs.q(q))
                .and(ProductSpecs.category(category))
                .and(ProductSpecs.priceMin(minPrice))
                .and(ProductSpecs.priceMax(maxPrice))
                .and(ProductSpecs.inStockOnly(inStock));

        Page<Product> idPage = products.findAll(idSpec, pageable);

        // Then fetch the actual products with their inventory
        List<Long> productIds = idPage.getContent().stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Product> productsWithInventory;
        if (!productIds.isEmpty()) {
            // Fetch products with inventory using the IDs
            productsWithInventory = products.findAllById(productIds).stream()
                    .map(product -> products.findByIdWithInventory(product.getId()).orElse(product))
                    .collect(Collectors.toList());
        } else {
            productsWithInventory = Collections.emptyList();
        }

        List<ProductCardView> items = productsWithInventory.stream().map(this::toCard).toList();
        return new PageView<>(items, idPage.getTotalElements());
    }

    // GET /api/catalog/products/{id}
    @GetMapping("/products/{id}")
    public ProductDetailView detail(@PathVariable Long id) {
        // Use the new repository method that eagerly fetches inventory
        Product p = products.findByIdWithInventory(id).orElseThrow(() ->
                new RuntimeException("Product not found with id: " + id));
        return toDetail(p);
    }

    // TEMPORARY: Debug endpoint to check inventory data
    @GetMapping("/debug/products/{id}")
    public String debugProduct(@PathVariable Long id) {
        Product p = products.findByIdWithInventory(id).orElse(null);
        if (p == null) {
            return "Product not found";
        }

        return String.format("Product: %s, Inventory: %s, StockOnHand: %d, ReservedQty: %d, TransientStock: %d",
                p.getName(),
                p.getInventory() != null ? "EXISTS" : "NULL",
                p.getInventory() != null ? p.getInventory().getStockOnHand() : -1,
                p.getInventory() != null ? p.getInventory().getReservedQty() : -1,
                p.getStockQuantity() != null ? p.getStockQuantity() : -999
        );
    }

    // ---- UPDATED mapping helpers with fallback to transient methods ----
    private ProductCardView toCard(Product p) {
        int avail;
        Boolean inStock;

        if (p.getInventory() != null) {
            // Use inventory data if available
            int soh = getSafe(p.getInventory(), true);
            int res = getSafe(p.getInventory(), false);
            avail = Math.max(0, soh - res);
            inStock = avail > 0;
        } else {
            // Fallback to transient methods if inventory is null
            avail = p.getAvailableStock() != null ? p.getAvailableStock() : 0;
            inStock = p.getInStock() != null ? p.getInStock() : false;
        }

        return new ProductCardView(
                p.getId(), p.getSku(), p.getName(),
                p.getCategory(), p.getUnit(),
                p.getPrice(), p.getImageUrl(),
                avail, inStock
        );
    }

    private ProductDetailView toDetail(Product p) {
        int soh, res, avail;

        if (p.getInventory() != null) {
            // Use inventory data if available
            soh = getSafe(p.getInventory(), true);
            res = getSafe(p.getInventory(), false);
            avail = Math.max(0, soh - res);
        } else {
            // Fallback to transient methods if inventory is null
            soh = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            res = 0; // Transient method doesn't provide reserved quantity
            avail = p.getAvailableStock() != null ? p.getAvailableStock() : 0;
        }

        return new ProductDetailView(
                p.getId(), p.getSku(), p.getName(),
                p.getCategory(), p.getUnit(),
                p.getPrice(), p.getImageUrl(),
                soh, res, avail
        );
    }

    private int getSafe(Inventory inv, boolean soh) {
        if (inv == null) return 0;
        Integer v = soh ? inv.getStockOnHand() : inv.getReservedQty();
        return v == null ? 0 : v;
    }
}