package com.freshchart.delivery.controller;

import com.freshchart.delivery.entity.Driver;
import com.freshchart.delivery.repository.DeliveryAssignmentRepository;
import com.freshchart.delivery.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/drivers")
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;
    @Autowired
    private DeliveryAssignmentRepository assignmentRepository;

    // Driver list & manage page
    @GetMapping
    public String showDrivers(Model model) {
        List<Driver> drivers = driverRepository.findAll();
        model.addAttribute("drivers", drivers);
        model.addAttribute("driver", new Driver()); // for add form
        return "manage-driver";
    }

    // Add new driver
    @PostMapping("/add")
    public String addDriver(@ModelAttribute Driver driver) {
        driver.setAvailable(true); // default: available
        driverRepository.save(driver);
        return "redirect:/drivers";
    }
    @GetMapping("/delete/{id}")
    public String deleteDriver(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        if (assignmentRepository.existsByDriverId(id)) {
            redirectAttributes.addFlashAttribute("error", "Driver is assigned to a delivery. Cannot delete!");
        } else {
            driverRepository.deleteById(id);
            redirectAttributes.addFlashAttribute("message", "Driver deleted successfully!");
        }
        return "redirect:/drivers";
    }


    // Delete driver
//    @GetMapping("/delete/{id}")
//    public String deleteDriver(@PathVariable Long id) {
//        driverRepository.deleteById(id);
//        return "redirect:/drivers";
//    }
////    @PostMapping("/delete/{id}")
//    public String deleteDriver(@PathVariable Long id, Model model) {
//        if (!assignmentRepository.existsByDriverId(id)) {
//            driverRepository.deleteById(id);
//            model.addAttribute("message", "Driver deleted successfully!");
//        } else {
//            model.addAttribute("error", "Driver is assigned to a delivery. Cannot delete!");
//        }
//        return "redirect:/manage-drivers";
//    }

}
