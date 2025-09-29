package com.freshchart.delivery.service;

import com.freshchart.delivery.entity.Customer;
import com.freshchart.delivery.entity.DeliveryAssignment;
import com.freshchart.delivery.entity.Driver;
import com.freshchart.delivery.entity.Order;
import com.freshchart.delivery.repository.CustomerRepository;
import com.freshchart.delivery.repository.DeliveryAssignmentRepository;
import com.freshchart.delivery.repository.DriverRepository;
import com.freshchart.delivery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DeliveryService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DeliveryAssignmentRepository assignmentRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private final String uploadDir = "uploads/";  // 🔥 folder path

    // -----------------------------------
    // Get all Ready Orders
    // -----------------------------------
    public List<Order> getReadyOrders() {
        return orderRepository.findByStatus("READY");
    }

    // -----------------------------------
    // Get all Available Drivers
    // -----------------------------------
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByAvailableTrue();
    }

    // -----------------------------------
    // Assign Order to Driver
    // -----------------------------------
    public void assignOrderToDriver(Long orderId, Long driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (!driver.isAvailable()) {
            throw new RuntimeException("Driver is not available");
        }

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setDriver(driver);
        assignment.setStatus("ASSIGNED");
        assignment.setAssignedAt(LocalDateTime.now());

        assignmentRepository.save(assignment);

        driver.setAvailable(false);
        driverRepository.save(driver);

        order.setStatus("ASSIGNED");
        orderRepository.save(order);
    }

    // -----------------------------------
    // Get All Deliveries
    // -----------------------------------
    public List<DeliveryAssignment> getAllDeliveries() {
        return assignmentRepository.findAll();
    }

    // -----------------------------------
    // Get Delivery by ID
    // -----------------------------------
    public DeliveryAssignment getDeliveryById(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Delivery assignment not found"));
    }

    // -----------------------------------
    // Update Delivery Status (with photo path save)
    // -----------------------------------
    public void updateStatus(Long assignmentId, String newStatus, MultipartFile photoProof) throws IOException {
        DeliveryAssignment assignment = getDeliveryById(assignmentId);

        assignment.setStatus(newStatus);
        assignment.setUpdatedAt(LocalDateTime.now());

        // Save photo proof if uploaded
        if (photoProof != null && !photoProof.isEmpty()) {
            // create uploads dir if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // unique filename
            String fileName = "proof_" + assignmentId + "_" + UUID.randomUUID() + ".jpg";
            Path filePath = uploadPath.resolve(fileName);

            // save file physically
            Files.write(filePath, photoProof.getBytes());

            // save file path in DB
            assignment.setPhotoProof(filePath.toString());
        }

        // if delivered → free driver
        if ("DELIVERED".equalsIgnoreCase(newStatus)) {
            Driver driver = assignment.getDriver();
            driver.setAvailable(true);
            driverRepository.save(driver);

            Order order = assignment.getOrder();
            order.setStatus("DELIVERED");
            orderRepository.save(order);
        }

        // if failed → mark order failed
        if ("FAILED".equalsIgnoreCase(newStatus)) {
            Order order = assignment.getOrder();
            order.setStatus("FAILED");
            orderRepository.save(order);
        }

        assignmentRepository.save(assignment);
    }

    // -----------------------------------
    // Reassign Failed Delivery
    // -----------------------------------
    public void reassignFailedDelivery(Long assignmentId, Long newDriverId) {
        DeliveryAssignment assignment = getDeliveryById(assignmentId);

        if (!"FAILED".equalsIgnoreCase(assignment.getStatus())) {
            throw new RuntimeException("Only failed deliveries can be reassigned");
        }

        Driver newDriver = driverRepository.findById(newDriverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (!newDriver.isAvailable()) {
            throw new RuntimeException("Driver not available");
        }

        assignment.setDriver(newDriver);
        assignment.setStatus("REASSIGNED");
        assignment.setAssignedAt(LocalDateTime.now());

        assignmentRepository.save(assignment);

        newDriver.setAvailable(false);
        driverRepository.save(newDriver);

        Order order = assignment.getOrder();
        order.setStatus("REASSIGNED");
        orderRepository.save(order);
    }

    // -----------------------------------
    // Track delivery by Order ID
    // -----------------------------------
    public DeliveryAssignment getAssignmentByOrderId(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return null;
        }
        return assignmentRepository.findByOrder(orderOpt.get()).orElse(null);
    }
}
