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
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvInventoryService {

    private final ProductRepository products;
    private final InventoryService invService;

    /**
     * Import simple CSV with rows: sku,deltaQty
     * - positive delta => IN
     * - negative delta => ADJUST (subtracts from stock)
     */
    @Transactional
    public int importAdjustments(InputStream csv, String actor) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(csv, StandardCharsets.UTF_8))) {
            String line;
            int count = 0;

            while ((line = br.readLine()) != null) {
                if (line.isBlank() || line.startsWith("#")) continue;

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

                Product p = products.findBySku(sku)
                        .orElse(null);

                if (p == null) {
                    // Skip unknown SKUs instead of throwing exception
                    continue;
                }

                invService.adjust(
                        p.getId(),
                        delta >= 0 ? StockMovement.Type.IN : StockMovement.Type.ADJUST,
                        Math.abs(delta),
                        "CSV", "bulk", actor
                );
                count++;
            }
            return count;
        }
    }

    /**
     * Export low stock CSV.
     * We receive Inventory rows; since Inventory has no back-reference to Product,
     * we resolve Product via repository by inventoryId to print sku/name.
     */
    public void writeLowStockCsv(List<Inventory> lows, OutputStream out) throws IOException {
        try (PrintWriter w = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            w.println("sku,name,available,reorderPoint");
            for (Inventory i : lows) {
                // Look up the Product by this inventory id
                Product p = i.getProduct();
                if (p == null) {
                    continue; // Skip if no product associated
                }

                int available = available(i);
                int rp = p.getReorderPoint() == null ? 0 : p.getReorderPoint();

                // basic CSV escaping for commas/quotes
                w.printf("%s,%s,%d,%d%n",
                        esc(p.getSku()),
                        esc(p.getName()),
                        available,
                        rp
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