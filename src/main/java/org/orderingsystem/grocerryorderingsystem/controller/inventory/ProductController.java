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
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository products;
    private final FileStorageService files;

    // ===== LIST =====
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
        } else if (lowOnly != null && lowOnly) {
            p = products.findLowStockProducts(pageable);
        } else {
            p = products.findAll(pageable);
        }

        var items = p.getContent().stream().map(Dtos::toResp).toList();
        return new PageResp<>(items, p.getTotalElements());
    }

    // ===== CREATE (multipart) =====
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Transactional
    public ProductResp create(@RequestParam String sku,
                              @RequestParam String name,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) String unit,
                              @RequestParam Double price,
                              @RequestParam(defaultValue = "0") Integer reorderPoint,
                              @RequestPart(value = "image", required = false) MultipartFile image) {
        validate(sku, name, price);

       /* // Debug: Check what's really in the database
        System.out.println("=== DEBUG SKU CHECK ===");
        System.out.println("Input SKU: '" + sku + "'");
        System.out.println("Input SKU length: " + sku.length());

        // Check with regular method
        Optional<Product> existingRegular = products.findBySku(sku);
        System.out.println("Regular check found: " + existingRegular.isPresent());

        // Check with trimmed method
        Optional<Product> existingTrimmed = products.findBySkuTrimmed(sku);
        System.out.println("Trimmed check found: " + existingTrimmed.isPresent());

        // Check with LIKE for similar SKUs
        List<Product> similarSkus = products.findBySkuContainingIgnoreCase(sku.substring(0, Math.min(3, sku.length())));
        System.out.println("Similar SKUs found: " + similarSkus.size());
        similarSkus.forEach(p -> System.out.println(" - '" + p.getSku() + "'"));

        // Now do the actual validation
        products.findBySku(sku).ifPresent(x -> {
            throw new IllegalArgumentException("SKU '" + sku + "' already exists as '" + x.getSku() + "' (ID: " + x.getId() + ")");
        });*/

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = files.save(image);
        }

        Product p = Product.builder()
                .sku(sku.trim())
                .name(name.trim())
                .category(nz(category))
                .unit(nz(unit))
                .price(price)
                .reorderPoint(reorderPoint == null ? 0 : reorderPoint)
                .imageUrl(imageUrl)
                .active(true)
                .build();

        // Create inventory with product reference
        Inventory inventory = Inventory.builder()
                .stockOnHand(0)
                .reservedQty(0)
                .product(p)
                .build();
        p.setInventory(inventory);

        p = products.save(p);
        return Dtos.toResp(p);
    }

    // ===== UPDATE (multipart; file optional) =====
    @PutMapping(value = "/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Transactional
    public ProductResp update(@PathVariable Long id,
                              @RequestParam String sku,
                              @RequestParam String name,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) String unit,
                              @RequestParam Double price,
                              @RequestParam(defaultValue = "0") Integer reorderPoint,
                              @RequestPart(value = "image", required = false) MultipartFile image) {

        validate(sku, name, price);

        Product p = products.findById(id).orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Optional<Product> existingSku = products.findBySku(sku);
        if (existingSku.isPresent() && !existingSku.get().getId().equals(id)) {
            throw new IllegalArgumentException("SKU already exists");
        }

        p.setSku(sku.trim());
        p.setName(name.trim());
        p.setCategory(nz(category));
        p.setUnit(nz(unit));
        p.setPrice(price);
        p.setReorderPoint(reorderPoint == null ? 0 : reorderPoint);

        if (image != null && !image.isEmpty()) {
            p.setImageUrl(files.save(image));
        }

        if (p.getInventory() == null) {
            Inventory inventory = Inventory.builder()
                    .stockOnHand(0)
                    .reservedQty(0)
                    .product(p)
                    .build();
            p.setInventory(inventory);
        }

        return Dtos.toResp(p);
    }

    // ===== EXPORT LOW STOCK (CSV) =====
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

    // ===== IMPORT CSV (accept & 204) =====
    @PostMapping(value = "/csv/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<Void> importCsv(@RequestPart("file") MultipartFile file) {
        // TODO: parse & upsert (left intentionally minimal to keep scope)
        return ResponseEntity.noContent().build();
    }

    // ===== DEBUG ENDPOINTS =====
    @GetMapping("/debug/sku-check/{sku}")
    public String checkSku(@PathVariable String sku) {
        Optional<Product> product = products.findBySku(sku);
        if (product.isPresent()) {
            return "SKU EXISTS: '" + product.get().getSku() + "' (ID: " + product.get().getId() + ")";
        } else {
            return "SKU NOT FOUND: '" + sku + "'";
        }
    }

    @GetMapping("/debug/all-skus")
    public List<String> getAllSkus() {
        List<Product> allProducts = products.findAll();
        return allProducts.stream()
                .map(p -> "'" + p.getSku() + "' (ID: " + p.getId() + ")")
                .toList();
    }

    // ===== helpers =====
    private static void validate(String sku, String name, Double price){
        if (sku == null || sku.isBlank())  throw new IllegalArgumentException("SKU is required");
        if (name == null || name.isBlank())throw new IllegalArgumentException("Name is required");
        if (price == null || price < 0)    throw new IllegalArgumentException("Price must be >= 0");
    }

    private static String nz(String s){ return (s == null || s.isBlank()) ? null : s.trim(); }

    private static String escape(String s){
        if (s == null) return "";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}