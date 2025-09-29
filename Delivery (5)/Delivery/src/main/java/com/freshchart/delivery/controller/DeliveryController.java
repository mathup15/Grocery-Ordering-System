package com.freshchart.delivery.controller;

import com.freshchart.delivery.entity.DeliveryAssignment;
import com.freshchart.delivery.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
@RequestMapping("/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // -----------------------------
    // Admin: Assign Delivery Page
    // -----------------------------
    @GetMapping("")
    public String assignPage(Model model,
                             @RequestParam(value = "message", required = false) String message,
                             @RequestParam(value = "error", required = false) String error) {
        model.addAttribute("readyOrders", deliveryService.getReadyOrders());  // only READY orders
        model.addAttribute("availableDrivers", deliveryService.getAvailableDrivers());
        model.addAttribute("message", message);
        model.addAttribute("error", error);
        return "assign-delivery";  // assign-delivery.html
    }

    // -----------------------------
    // Handle Assign Button
    // -----------------------------
    @PostMapping("/assign")
    public String assignDelivery(@RequestParam("orderId") Long orderId,
                                 @RequestParam("driverId") Long driverId) {
        try {
            deliveryService.assignOrderToDriver(orderId, driverId); // ✅ correct method call
            return "redirect:/delivery?message=Delivery assigned successfully";
        } catch (Exception e) {
            return "redirect:/delivery?error=" + e.getMessage();
        }
    }

    // -----------------------------
    // Show all deliveries (Driver view)
    // -----------------------------
    @GetMapping("/list")
    public String listDeliveries(Model model,
                                 @RequestParam(value = "message", required = false) String message,
                                 @RequestParam(value = "error", required = false) String error) {
        model.addAttribute("deliveries", deliveryService.getAllDeliveries());
        model.addAttribute("message", message);
        model.addAttribute("error", error);
        return "delivery-list";  // delivery-list.html
    }

    // -----------------------------
    // Show update status form
    // -----------------------------
    @GetMapping("/update-status/{id}")
    public String showUpdateForm(@PathVariable Long id, Model model) {
        DeliveryAssignment assignment = deliveryService.getDeliveryById(id);
        model.addAttribute("assignment", assignment);
        return "update-status";  // update-status.html
    }

    // -----------------------------
    // Handle update status
    // -----------------------------
    @PostMapping("/update-status/{id}")
    public String updateStatus(
            @PathVariable Long id,
            @RequestParam("newStatus") String newStatus,
            @RequestParam(value = "photoProof", required = false) MultipartFile photoProof
    ) throws IOException {
        deliveryService.updateStatus(id, newStatus, photoProof);
        return "redirect:/delivery/list?message=Status updated successfully";
    }

    // -----------------------------
    // Track delivery
    // -----------------------------
    @GetMapping("/track/{orderId}")
    public String trackDelivery(@PathVariable Long orderId, Model model) {
        DeliveryAssignment assignment = deliveryService.getAssignmentByOrderId(orderId);
        if (assignment == null) {
            model.addAttribute("error", "No delivery found for this order");
        } else {
            model.addAttribute("assignment", assignment);
        }
        return "track-delivery";  // track-delivery.html
    }

    // -----------------------------
    // Serve Proof Image
    // -----------------------------
    @GetMapping("/proof/{id}")
    public ResponseEntity<?> getProofImage(@PathVariable Long id) throws IOException {
        DeliveryAssignment assignment = deliveryService.getDeliveryById(id);

        if (assignment.getPhotoProof() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(assignment.getPhotoProof());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        byte[] imageBytes = Files.readAllBytes(filePath);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"proof_" + id + ".jpg\"")
                .contentType(MediaType.IMAGE_JPEG)
                .body(new ByteArrayResource(imageBytes));
    }
}
