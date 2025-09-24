package org.orderingsystem.grocerryorderingsystem.service;

import org.orderingsystem.grocerryorderingsystem.dto.InvoiceDto;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public InvoiceDto generateInvoice(String orderNumber) {
        InvoiceDto invoice = new InvoiceDto();
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setOrderNumber(orderNumber);
        invoice.setInvoiceDate(LocalDateTime.now());
        return invoice;
    }

    public byte[] generatePdfInvoice(InvoiceDto invoice) {
        String html = generateInvoiceHtml(invoice);
        return html.getBytes();
    }

    private String generateInvoiceHtml(InvoiceDto invoice) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
                "<meta charset='UTF-8'>" +
                "<title>Invoice</title>" +
                "<style>" +
                    "body { font-family: Arial, sans-serif; margin: 20px; }" +
                    ".header { text-align: center; margin-bottom: 30px; }" +
                    ".company-name { font-size: 24px; font-weight: bold; color: #16a34a; }" +
                    ".invoice-details { margin: 20px 0; }" +
                    ".table { width: 100%; border-collapse: collapse; margin: 20px 0; }" +
                    ".table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }" +
                    ".table th { background-color: #f0fdf4; }" +
                    ".total-row { font-weight: bold; background-color: #f9f9f9; }" +
                "</style>" +
            "</head>" +
            "<body>" +
                "<div class='header'>" +
                    "<div class='company-name'>FreshMart</div>" +
                    "<p>Fresh Groceries Delivered</p>" +
                "</div>" +
                "<div class='invoice-details'>" +
                    "<h2>INVOICE</h2>" +
                    "<p><strong>Invoice Number:</strong> " + invoice.getInvoiceNumber() + "</p>" +
                    "<p><strong>Order Number:</strong> " + invoice.getOrderNumber() + "</p>" +
                    "<p><strong>Date:</strong> " + invoice.getInvoiceDate().format(formatter) + "</p>" +
                "</div>" +
                "<table class='table'>" +
                    "<thead>" +
                        "<tr>" +
                            "<th>Item</th>" +
                            "<th>Quantity</th>" +
                            "<th>Unit Price</th>" +
                            "<th>Total</th>" +
                        "</tr>" +
                    "</thead>" +
                    "<tbody>" +
                        "<tr>" +
                            "<td>Sample Product</td>" +
                            "<td>1</td>" +
                            "<td>LKR 1,000</td>" +
                            "<td>LKR 1,000</td>" +
                        "</tr>" +
                        "<tr class='total-row'>" +
                            "<td colspan='3'>TOTAL</td>" +
                            "<td>LKR 1,000</td>" +
                        "</tr>" +
                    "</tbody>" +
                "</table>" +
                "<p style='text-align: center; margin-top: 30px;'>Thank you for shopping with FreshMart!</p>" +
            "</body>" +
            "</html>";
    }
}