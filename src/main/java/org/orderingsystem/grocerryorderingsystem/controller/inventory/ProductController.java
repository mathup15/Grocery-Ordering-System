package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.orderingsystem.grocerryorderingsystem.service.Storage.FileStorageService;
import org.springframework.data.domain.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository products;
    private final FileStorageService files;

    // ------- LIST -------
    @GetMapping("/products")
    public PageResp<ProductResp> list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "12") int size,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(required = false) String category,
                                      @RequestParam(defaultValue = "name") String sort,
                                      @RequestParam(required = false) Boolean lowOnly) {

        Sort s = "new".equalsIgnoreCase(sort)
                ? Sort.by(Sort.Direction.DESC, "id")
                : Sort.by(Sort.Direction.ASC, sort);
        Pageable pageable = PageRequest.of(page, size, s);

        Page<Product> p;
        if (q != null && !q.isBlank()) {
            p = products.findByNameContainingIgnoreCaseOrSkuContainingIgnoreCase(q, q, pageable);
        } else if (category != null && !category.isBlank()) {
            p = products.findByCategoryIgnoreCase(category, pageable);
        } else {
            p = products.findAll(pageable);
        }

        // Optional low-stock filter (manual, keeps repo simple)
        List<Product> source = p.getContent();
        List<Product> filtered = new ArrayList<>();
        if (Boolean.TRUE.equals(lowOnly)) {
            for (Product prod : source) {
                int soh = prod.getInventory() == null || prod.getInventory().getStockOnHand() == null
                        ? 0 : prod.getInventory().getStockOnHand();
                int res = prod.getInventory() == null || prod.getInventory().getReservedQty() == null
                        ? 0 : prod.getInventory().getReservedQty();
                int avail = Math.max(0, soh - res);
                int rp = prod.getReorderPoint() == null ? 0 : prod.getReorderPoint();
                if (avail <= rp) filtered.add(prod);
            }
        } else {
            filtered = source;
        }

        var items = filtered.stream().map(ProductController::toResp).toList();
        long total = Boolean.TRUE.equals(lowOnly) ? items.size() : p.getTotalElements();
        return new PageResp<>(items, total);
    }

    // ------- CREATE (JSON or multipart) -------
    @PostMapping(value = "/products",
            consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Transactional
    public ProductResp create(
            @RequestBody(required = false) ProductCreateJson json,
            @RequestParam(required = false) String sku,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) Double price,
            @RequestParam(required = false, defaultValue = "0") Integer reorderPoint,
            @RequestParam(required = false) String imageUrl,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        if (json != null) {
            sku = json.sku(); name = json.name(); category = json.category(); unit = json.unit();
            price = json.price(); reorderPoint = json.reorderPoint(); imageUrl = json.imageUrl();
        }
        validate(sku, name, price);
        products.findBySku(sku).ifPresent(x -> { throw new IllegalArgumentException("SKU already exists"); });

        String finalImageUrl = null;
        if (image != null && !image.isEmpty()) finalImageUrl = files.save(image);
        else if (imageUrl != null && !imageUrl.isBlank()) finalImageUrl = imageUrl.trim();

        Product p = Product.builder()
                .sku(sku.trim())
                .name(name.trim())
                .category(nz(category))
                .unit(nz(unit))
                .price(price)
                .reorderPoint(reorderPoint == null ? 0 : reorderPoint)
                .imageUrl(finalImageUrl)
                .active(true)
                .build();

        // Product owns the relation (inventory_id on products)
        if (p.getInventory() == null) {
            p.setInventory(Inventory.builder().stockOnHand(0).reservedQty(0).build());
        }

        p = products.save(p);
        return toResp(p);
    }

    // ------- UPDATE (JSON or multipart) -------
    @PutMapping(value = "/products/{id}",
            consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Transactional
    public ProductResp update(@PathVariable Long id,
                              @RequestBody(required = false) ProductCreateJson json,
                              @RequestParam(required = false) String sku,
                              @RequestParam(required = false) String name,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) String unit,
                              @RequestParam(required = false) Double price,
                              @RequestParam(required = false) Integer reorderPoint,
                              @RequestParam(required = false) String imageUrl,
                              @RequestPart(value = "image", required = false) MultipartFile image) {

        if (json != null) {
            sku = json.sku(); name = json.name(); category = json.category(); unit = json.unit();
            price = json.price(); reorderPoint = json.reorderPoint(); imageUrl = json.imageUrl();
        }
        validate(sku, name, price);

        Product p = products.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));

        products.findBySku(sku)
                .filter(x -> !x.getId().equals(id))
                .ifPresent(x -> { throw new IllegalArgumentException("SKU already exists"); });

        p.setSku(sku.trim());
        p.setName(name.trim());
        p.setCategory(nz(category));
        p.setUnit(nz(unit));
        p.setPrice(price);
        p.setReorderPoint(reorderPoint == null ? 0 : reorderPoint);

        if (image != null && !image.isEmpty()) {
            p.setImageUrl(files.save(image));
        } else if (imageUrl != null) {
            p.setImageUrl(imageUrl.isBlank() ? null : imageUrl.trim());
        }

        if (p.getInventory() == null) {
            p.setInventory(Inventory.builder().stockOnHand(0).reservedQty(0).build());
        }

        return toResp(p);
    }

    // ------- EXPORT LOW STOCK (CSV) -------
    @GetMapping("/reports/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<byte[]> exportLowStock() {
        List<Product> all = products.findAll(Sort.by("name"));
        StringBuilder sb = new StringBuilder("SKU,Name,Category,ReorderPoint\n");
        for (Product p : all) {
            int rp = p.getReorderPoint() == null ? 0 : p.getReorderPoint();
            sb.append(escape(p.getSku())).append(',')
                    .append(escape(p.getName())).append(',')
                    .append(escape(p.getCategory())).append(',')
                    .append(rp).append('\n');
        }
        byte[] csv = sb.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "low-stock-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.valueOf("text/csv"))
                .body(csv);
    }

    // ------- helpers -------
    private static void validate(String sku, String name, Double price){
        if (sku == null || sku.isBlank())  throw new IllegalArgumentException("SKU is required");
        if (name == null || name.isBlank())throw new IllegalArgumentException("Name is required");
        if (price == null || price < 0)    throw new IllegalArgumentException("Price must be >= 0");
    }
    private static String nz(String s){ return (s == null || s.isBlank()) ? null : s.trim(); }
    private static String escape(String s){ return s == null ? "" : "\"" + s.replace("\"","\"\"") + "\""; }

    private static ProductResp toResp(Product p){
        var inv = p.getInventory();
        int soh = (inv == null || inv.getStockOnHand() == null) ? 0 : inv.getStockOnHand();
        int res = (inv == null || inv.getReservedQty() == null) ? 0 : inv.getReservedQty();
        int avail = Math.max(0, soh - res);
        return ProductResp.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .category(p.getCategory())
                .unit(p.getUnit())
                .price(p.getPrice())
                .reorderPoint(p.getReorderPoint())
                .imageUrl(p.getImageUrl())
                .active(p.getActive() != null ? p.getActive() : Boolean.TRUE)
                .stockOnHand(soh)
                .reservedQty(res)
                .availableQty(avail)
                .build();
    }

    // JSON DTO (when not uploading a file)
    public record ProductCreateJson(
            String sku, String name, String category, String unit,
            Double price, Integer reorderPoint, String imageUrl
    ){}

    // Page wrapper
    public record PageResp<T>(List<T> items, long total){}
}
