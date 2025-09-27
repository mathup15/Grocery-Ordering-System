package com.freshchart.delivery.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "drivers")
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    private String name;

    @NotBlank(message = "Contact is required")
    @Size(max = 50, message = "Contact too long")
    private String contact;

    private boolean available;

    @Size(max = 255, message = "Location too long")
    private String location;

    // Getters, Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}