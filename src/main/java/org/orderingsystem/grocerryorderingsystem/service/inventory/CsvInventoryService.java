package org.orderingsystem.grocerryorderingsystem.service.inventory;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Inventory;
import org.orderingsystem.grocerryorderingsystem.model.inventory.Product;
import org.orderingsystem.grocerryorderingsystem.model.inventory.StockMovement;
import org.orderingsystem.grocerryorderingsystem.repository.inventory.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvInventoryService {

    private final ProductRepository products;
    private final InventoryService invService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Import CSV with rows: sku,deltaQty,expiryDate,batchNumber
     * Format: SKU,Quantity,ExpiryDate(YYYY-MM-DD),BatchNumber
     * Example: DAIRY_004,50,2024-12-31,BATCH-001
     */
    @Transactional
    public int importAdjustments(InputStream csv, String actor) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(csv, StandardCharsets.UTF_8))) {
            String line;
            int count = 0;
            boolean firstLine = true;

            while ((line = br.readLine()) != null) {
                if (line.isBlank() || line.startsWith("#")) continue;

                // Skip header line if present
                if (firstLine && (line.toLowerCase().contains("sku") || line.toLowerCase().contains("quantity"))) {
                    firstLine = false;
                    continue;
                }
                firstLine = false;

                String[] t = line.split(",");
                if (t.length < 2) continue;

                String sku = t[0].trim();
                String qtyStr = t[1].trim();

                int delta;
                try {
                    delta = Integer.parseInt(qtyStr);
                } catch (NumberFormatException nfe) {
                    // skip bad line
                    continue;
                }

                Product p = products.findBySku(sku).orElse(null);
                if (p == null) {
                    // Skip unknown SKUs instead of throwing exception
                    continue;
                }

                // Handle expiry date if provided (3rd column)
                LocalDate expiryDate = null;
                String batchNumber = null;

                if (t.length >= 3 && !t[2].trim().isEmpty()) {
                    try {
                        expiryDate = LocalDate.parse(t[2].trim(), DATE_FORMATTER);
                    } catch (DateTimeParseException e) {
                        // Skip or log invalid date format
                        System.err.println("Invalid date format for SKU " + sku + ": " + t[2].trim());
                    }
                }

                // Handle batch number if provided (4th column)
                if (t.length >= 4 && !t[3].trim().isEmpty()) {
                    batchNumber = t[3].trim();
                }

                // Perform the stock adjustment
                invService.adjustWithExpiry(
                        p.getId(),
                        delta >= 0 ? StockMovement.Type.IN : StockMovement.Type.ADJUST,
                        Math.abs(delta),
                        expiryDate,
                        batchNumber,
                        "CSV", "bulk", actor
                );
                count++;
            }
            return count;
        }
    }

    /**
     * Export low stock CSV with expiry details.
     * Columns: sku,name,available,reorderPoint,expiryDate,batchNumber,status
     */
    public void writeLowStockCsv(List<Inventory> lows, OutputStream out) throws IOException {
        try (PrintWriter w = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            w.println("sku,name,available,reorderPoint,expiryDate,batchNumber,status");
            for (Inventory i : lows) {
                Product p = i.getProduct();
                if (p == null) {
                    continue; // Skip if no product associated
                }

                int available = available(i);
                int rp = p.getReorderPoint() == null ? 0 : p.getReorderPoint();

                String expiryStr = i.getExpiryDate() != null ? i.getExpiryDate().format(DATE_FORMATTER) : "";
                String batchStr = i.getBatchNumber() != null ? i.getBatchNumber() : "";

                String status = "OK";
                if (i.isExpired()) {
                    status = "EXPIRED";
                } else if (i.expiresSoon()) {
                    status = "EXPIRES_SOON";
                }

                w.printf("%s,%s,%d,%d,%s,%s,%s%n",
                        esc(p.getSku()),
                        esc(p.getName()),
                        available,
                        rp,
                        esc(expiryStr),
                        esc(batchStr),
                        status
                );
            }
        }
    }

    /**
     * NEW: Export expiry report CSV
     */
    public void writeExpiryReportCsv(List<Inventory> inventories, OutputStream out) throws IOException {
        try (PrintWriter w = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            w.println("sku,name,batchNumber,currentStock,expiryDate,daysUntilExpiry,status");

            for (Inventory i : inventories) {
                Product p = i.getProduct();
                if (p == null || i.getExpiryDate() == null) {
                    continue;
                }

                long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(
                        LocalDate.now(), i.getExpiryDate()
                );

                String status = "OK";
                if (daysUntilExpiry < 0) {
                    status = "EXPIRED";
                } else if (daysUntilExpiry <= 30) {
                    status = "EXPIRES_SOON";
                }

                w.printf("%s,%s,%s,%d,%s,%d,%s%n",
                        esc(p.getSku()),
                        esc(p.getName()),
                        esc(i.getBatchNumber() != null ? i.getBatchNumber() : ""),
                        i.getStockOnHand() != null ? i.getStockOnHand() : 0,
                        i.getExpiryDate().format(DATE_FORMATTER),
                        daysUntilExpiry,
                        status
                );
            }
        }
    }

    private static int available(Inventory inv) {
        int soh = inv.getStockOnHand() == null ? 0 : inv.getStockOnHand();
        int res = inv.getReservedQty() == null ? 0 : inv.getReservedQty();
        return Math.max(0, soh - res);
    }

    // Very simple CSV escape (wrap in quotes and double inner quotes)
    private static String esc(String s) {
        if (s == null) return "";
        String q = s.replace("\"", "\"\"");
        return "\"" + q + "\"";
    }
}