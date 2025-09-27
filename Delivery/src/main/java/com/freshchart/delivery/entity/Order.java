package com.freshchart.delivery.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link with Customer table (foreign key)
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotBlank(message = "Address is required")
    @Size(max = 255, message = "Address too long")
    @Column(name = "address", nullable = false)
    private String address;

    @NotBlank(message = "Contact info is required")
    @Size(max = 100, message = "Contact info too long")
    @Column(name = "contact_info", nullable = false)
    private String contactInfo;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false)
    private String status;

    // Default constructor
    public Order() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
