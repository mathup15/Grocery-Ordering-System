package com.freshchart.delivery.controller;

import com.freshchart.delivery.entity.Driver;
import com.freshchart.delivery.repository.DriverRepository;
import com.freshchart.delivery.repository.DeliveryAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DeliveryAssignmentRepository assignmentRepository; // ✅ inject pannunga

    // -----------------------------
    // Default -> Manage Drivers Page
    // -----------------------------
    @GetMapping
    public String defaultRedirect() {
        return "redirect:/drivers/manage";
    }

    // -----------------------------
    // Manage Drivers Page (List)
    // -----------------------------
    @GetMapping("/manage")
    public String manageDrivers(Model model,
                                @RequestParam(value = "message", required = false) String message,
                                @RequestParam(value = "error", required = false) String error) {
        model.addAttribute("drivers", driverRepository.findAll());
        model.addAttribute("message", message);
        model.addAttribute("error", error);
        return "manage-driver"; // manage-driver.html
    }

    // -----------------------------
    // Add New Driver
    // -----------------------------
    @PostMapping("/add")
    public String addDriver(@RequestParam String name,
                            @RequestParam String phoneNumber,
                            @RequestParam boolean available) {
        try {
            Driver driver = new Driver();
            driver.setName(name);
            driver.setPhoneNumber(phoneNumber);
            driver.setAvailable(available);

            driverRepository.save(driver);
            return "redirect:/drivers/manage?message=" +
                    URLEncoder.encode("Driver added successfully", StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "redirect:/drivers/manage?error=" +
                    URLEncoder.encode("Error adding driver: " + e.getMessage(), StandardCharsets.UTF_8);
        }
    }

    // -----------------------------
    // Show Edit Driver Form
    // -----------------------------
    @GetMapping("/edit/{id}")
    public String editDriver(@PathVariable Long id, Model model) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        model.addAttribute("driver", driver);
        return "edit-driver"; // 🔥 need to create edit-driver.html
    }

    // -----------------------------
    // Update Driver
    // -----------------------------
    @PostMapping("/update/{id}")
    public String updateDriver(@PathVariable Long id,
                               @RequestParam String name,
                               @RequestParam String phoneNumber,
                               @RequestParam boolean available) {
        try {
            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            driver.setName(name);
            driver.setPhoneNumber(phoneNumber);
            driver.setAvailable(available);

            driverRepository.save(driver);
            return "redirect:/drivers/manage?message=" +
                    URLEncoder.encode("Driver updated successfully", StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "redirect:/drivers/manage?error=" +
                    URLEncoder.encode("Error updating driver: " + e.getMessage(), StandardCharsets.UTF_8);
        }
    }

    // -----------------------------
    // Delete Driver (with check)
    // -----------------------------
    @GetMapping("/delete/{id}")
    public String deleteDriver(@PathVariable Long id) {
        try {
            // ✅ Check if driver is assigned to any delivery
            if (assignmentRepository.existsByDriverId(id)) {
                return "redirect:/drivers/manage?error=" +
                        URLEncoder.encode("Driver is already assigned to a delivery, cannot be deleted!", StandardCharsets.UTF_8);
            }

            driverRepository.deleteById(id);
            return "redirect:/drivers/manage?message=" +
                    URLEncoder.encode("Driver deleted successfully", StandardCharsets.UTF_8);

        } catch (Exception e) {
            return "redirect:/drivers/manage?error=" +
                    URLEncoder.encode("Error deleting driver: " + e.getMessage(), StandardCharsets.UTF_8);
        }
    }
}
