package org.orderingsystem.grocerryorderingsystem.controller.catalog;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.search.ProductSpecs;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

        Specification<Product> spec = Specification
                .where(ProductSpecs.activeTrue())
                .and(ProductSpecs.q(q))
                .and(ProductSpecs.category(category))
                .and(ProductSpecs.priceMin(minPrice))
                .and(ProductSpecs.priceMax(maxPrice))
                .and(ProductSpecs.inStockOnly(inStock));

        Page<Product> p = products.findAll(spec, pageable);

        List<ProductCardView> items = p.getContent().stream().map(this::toCard).toList();
        return new PageView<>(items, p.getTotalElements());
    }

    // GET /api/catalog/products/{id}
    @GetMapping("/products/{id}")
    public ProductDetailView detail(@PathVariable Long id) {
        Product p = products.findById(id).orElseThrow();
        return toDetail(p);
    }

    // ---- mapping helpers ----
    private ProductCardView toCard(Product p) {
        int soh = getSafe(p.getInventory(), true);
        int res = getSafe(p.getInventory(), false);
        int avail = Math.max(0, soh - res);
        return new ProductCardView(
                p.getId(), p.getSku(), p.getName(),
                p.getCategory(), p.getUnit(),
                p.getPrice(), p.getImageUrl(),
                avail, avail > 0
        );
    }

    private ProductDetailView toDetail(Product p) {
        int soh = getSafe(p.getInventory(), true);
        int res = getSafe(p.getInventory(), false);
        int avail = Math.max(0, soh - res);
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
