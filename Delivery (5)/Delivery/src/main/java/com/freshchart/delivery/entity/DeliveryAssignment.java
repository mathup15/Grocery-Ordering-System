package com.freshchart.delivery.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_assignments")
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ஒவ்வொரு Orderக்கும் ஒரே ஒரு DeliveryAssignment
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // ஒரு Driverக்கு பல Assignments இருக்கலாம்
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(nullable = false, length = 50)
    private String status; // ASSIGNED / OUT_FOR_DELIVERY / DELIVERED / FAILED

    // Proof of delivery (image path in filesystem, not binary)
    @Column(name = "photo_proof", length = 255)
    private String photoProof;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // -----------------------
    // Constructors
    // -----------------------
    public DeliveryAssignment() {}

    public DeliveryAssignment(Order order, Driver driver, String status) {
        this.order = order;
        this.driver = driver;
        this.status = status;
        this.assignedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // -----------------------
    // Getters & Setters
    // -----------------------
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhotoProof() { return photoProof; }
    public void setPhotoProof(String photoProof) { this.photoProof = photoProof; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // -----------------------
    // Utility methods
    // -----------------------
    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
