package org.orderingsystem.grocerryorderingsystem.controller;

import org.orderingsystem.grocerryorderingsystem.dto.InvoiceDto;
import org.orderingsystem.grocerryorderingsystem.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoice")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping("/{orderNumber}")
    public ResponseEntity<InvoiceDto> getInvoice(@PathVariable String orderNumber) {
        InvoiceDto invoice = invoiceService.generateInvoice(orderNumber);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/{orderNumber}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderNumber) {
        InvoiceDto invoice = invoiceService.generateInvoice(orderNumber);
        byte[] pdfBytes = invoiceService.generatePdfInvoice(invoice);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_HTML);
        headers.setContentDispositionFormData("attachment", "invoice-" + orderNumber + ".html");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}