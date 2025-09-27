package com.freshchart.delivery.controller;

import com.freshchart.delivery.entity.DeliveryAssignment;
import com.freshchart.delivery.entity.Driver;
import com.freshchart.delivery.entity.Order;
import com.freshchart.delivery.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Controller
@RequestMapping("/delivery")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // -------------------------------
    // Assign Delivery Page
    // -------------------------------
    @GetMapping
    public String showAssignPage(Model model) {
        List<Order> readyOrders = deliveryService.getReadyOrders();
        List<Driver> availableDrivers = deliveryService.getAvailableDrivers();

        // DEBUG: Ensure data is fetched
        System.out.println("Ready Orders: " + readyOrders.size());
        System.out.println("Available Drivers: " + availableDrivers.size());

        model.addAttribute("readyOrders", readyOrders);
        model.addAttribute("availableDrivers", availableDrivers);

        return "assign-delivery";
    }

    // -------------------------------
    // Assign Order to Driver
    // -------------------------------
    @PostMapping("/assign")
    public String assignOrder(@RequestParam Long orderId,
                              @RequestParam Long driverId,
                              Model model) {
        try {
            deliveryService.assignOrderToDriver(orderId, driverId);
            model.addAttribute("message", "Order assigned successfully!");
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "redirect:/delivery";
    }

    // -------------------------------
    // Delivery List Page
    // -------------------------------
    @GetMapping("/list")   // ✅ corrected mapping
    public String showDeliveryList(Model model) {
        List<DeliveryAssignment> deliveries = deliveryService.getAllDeliveries();
        model.addAttribute("deliveries", deliveries);
        return "delivery-list";  // ✅ maps to templates/delivery-list.html
    }

    // -------------------------------
    // Update Status Page (Driver)
    // -------------------------------
    @GetMapping("/update-status/{assignmentId}")
    public String showUpdateStatusForm(@PathVariable Long assignmentId, Model model) {
        DeliveryAssignment assignment = deliveryService.getDeliveryById(assignmentId);
        model.addAttribute("assignment", assignment);
        return "update-status";
    }

    // -------------------------------
    // Update Status POST
    // -------------------------------
    @PostMapping("/update-status/{assignmentId}")
    public String updateStatus(@PathVariable Long assignmentId,
                               @RequestParam String newStatus,
                               @RequestParam(required = false) MultipartFile photoProof,
                               Model model) {
        try {
            deliveryService.updateStatus(assignmentId, newStatus, photoProof);
            model.addAttribute("message", "Status updated successfully!");
        } catch (IOException e) {
            model.addAttribute("error", "File upload error: " + e.getMessage());
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "redirect:/delivery/list";
    }

    // -------------------------------
    // Reassign Failed Delivery
    // -------------------------------
    @PostMapping("/reassign/{assignmentId}")
    public String reassign(@PathVariable Long assignmentId,
                           @RequestParam Long newDriverId,
                           Model model) {
        try {
            deliveryService.reassignFailedDelivery(assignmentId, newDriverId);
            model.addAttribute("message", "Reassigned successfully!");
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "redirect:/delivery/list";
    }

    // -------------------------------
    // Track Delivery for User
    // -------------------------------
    @GetMapping("/track/{orderId}")
    public String trackDelivery(@PathVariable Long orderId, Model model) {
        DeliveryAssignment assignment = deliveryService.getAssignmentByOrderId(orderId);
        if (assignment == null) {
            model.addAttribute("error", "Delivery not found for this order");
            return "track-delivery";
        }
        model.addAttribute("assignment", assignment);
        return "track-delivery";
    }
}
