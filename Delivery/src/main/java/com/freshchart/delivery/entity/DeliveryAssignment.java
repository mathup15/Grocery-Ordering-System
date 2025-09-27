package com.freshchart.delivery.entity;

import jakarta.persistence.*;
        import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
public class DeliveryAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @NotNull(message = "Driver is required")
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @NotBlank(message = "Status is required")
    private String status;

    private LocalDateTime assignedAt = LocalDateTime.now();

    private String photoProof;  // Path to uploaded file

    // Getters, Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public String getPhotoProof() { return photoProof; }
    public void setPhotoProof(String photoProof) { this.photoProof = photoProof; }
}

