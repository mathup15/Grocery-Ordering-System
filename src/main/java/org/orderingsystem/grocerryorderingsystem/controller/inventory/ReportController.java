package org.orderingsystem.grocerryorderingsystem.controller.inventory;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.service.inventory.CsvInventoryService;
import org.orderingsystem.grocerryorderingsystem.service.inventory.InventoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class ReportController {
    private final InventoryService invService;
    private final CsvInventoryService csv;

    @GetMapping(value="/reports/low-stock", produces="text/csv")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    public void lowStockCsv(HttpServletResponse res) throws IOException {
        res.setHeader("Content-Disposition", "attachment; filename=low-stock.csv");
        csv.writeLowStockCsv(invService.lowStock(), res.getOutputStream());
    }

    @PostMapping("/csv/import")
    @PreAuthorize("hasAnyRole('STAFF','MANAGER','ADMIN')")
    public Map<String,Integer> importCsv(@RequestPart("file") MultipartFile file,
                                         Authentication auth) throws IOException {
        int processed = csv.importAdjustments(file.getInputStream(), auth.getName());
        return Map.of("processed", processed);
    }
}