package org.orderingsystem.grocerryorderingsystem.dto;

import org.orderingsystem.grocerryorderingsystem.model.Role;

public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private Role role;

    public UserDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}