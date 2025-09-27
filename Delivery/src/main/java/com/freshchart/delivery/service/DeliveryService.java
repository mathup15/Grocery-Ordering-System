package com.freshchart.delivery.service;

import com.freshchart.delivery.entity.DeliveryAssignment;
import com.freshchart.delivery.entity.Driver;
import com.freshchart.delivery.entity.Order;
import com.freshchart.delivery.repository.DeliveryAssignmentRepository;
import com.freshchart.delivery.repository.DriverRepository;
import com.freshchart.delivery.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class DeliveryService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private DeliveryAssignmentRepository assignmentRepository;

    // ✅ Fetch READY & unassigned orders
    public List<Order> getReadyOrders() {
        return orderRepository.findReadyUnassignedOrders();
    }

    // ✅ Fetch available drivers
    public List<Driver> getAvailableDrivers() {
        return driverRepository.findByAvailableTrue();
    }

    // ✅ Fetch all deliveries
    public List<DeliveryAssignment> getAllDeliveries() {
        return assignmentRepository.findAll();
    }

    // ✅ Fetch delivery by assignmentId
    public DeliveryAssignment getDeliveryById(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
    }

    // ✅ Fetch delivery assignment by orderId
    public DeliveryAssignment getAssignmentByOrderId(Long orderId) {
        return assignmentRepository.findByOrderId(orderId);
    }

    // ✅ Assign order to driver
    @Transactional
    public DeliveryAssignment assignOrderToDriver(Long orderId, Long driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        if (!"READY".equals(order.getStatus())) throw new IllegalStateException("Order not ready");
        if (!driver.isAvailable()) throw new IllegalStateException("Driver not available");

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setDriver(driver);
        assignment.setStatus("ASSIGNED");

        order.setStatus("ASSIGNED");
        driver.setAvailable(false);

        orderRepository.save(order);
        driverRepository.save(driver);
        return assignmentRepository.save(assignment);
    }

    // ✅ Update delivery status
    @Transactional
    public DeliveryAssignment updateStatus(Long assignmentId, String newStatus, MultipartFile photoProof) throws IOException {
        DeliveryAssignment assignment = getDeliveryById(assignmentId);

        assignment.setStatus(newStatus);

        // Handle photo upload
        if (photoProof != null && !photoProof.isEmpty()) {
            String fileName = UUID.randomUUID() + "_" + photoProof.getOriginalFilename();
            File uploadDir = new File("uploads");
            if (!uploadDir.exists()) uploadDir.mkdirs();
            photoProof.transferTo(new File(uploadDir, fileName));
            assignment.setPhotoProof("/uploads/" + fileName);
        }

        Driver driver = assignment.getDriver();
        Order order = assignment.getOrder();

        if ("DELIVERED".equals(newStatus)) {
            driver.setAvailable(true);
            order.setStatus("DELIVERED");
        } else if ("FAILED".equals(newStatus)) {
            driver.setAvailable(true);
            order.setStatus("READY");
        }

        driverRepository.save(driver);
        orderRepository.save(order);
        return assignmentRepository.save(assignment);
    }

    // ✅ Reassign failed delivery
    @Transactional
    public DeliveryAssignment reassignFailedDelivery(Long assignmentId, Long newDriverId) {
        DeliveryAssignment assignment = getDeliveryById(assignmentId);

        if (!"FAILED".equals(assignment.getStatus()))
            throw new IllegalStateException("Only failed deliveries can be reassigned");

        Driver newDriver = driverRepository.findById(newDriverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        if (!newDriver.isAvailable())
            throw new IllegalStateException("Driver not available");

        assignment.setDriver(newDriver);
        assignment.setStatus("ASSIGNED");
        assignment.getOrder().setStatus("ASSIGNED");

        newDriver.setAvailable(false);
        driverRepository.save(newDriver);
        orderRepository.save(assignment.getOrder());
        return assignmentRepository.save(assignment);
    }
}
