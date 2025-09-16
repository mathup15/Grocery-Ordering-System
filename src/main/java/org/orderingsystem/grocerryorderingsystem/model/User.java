package org.orderingsystem.grocerryorderingsystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String uniqueId;      // e.g., ADM-1001 / CUS-<generated>

    @Column(unique = true)
    private String username;      // email/username (customers can sign up)

    private String fullName;
    private String phone;

    @Column(nullable = false)
    private String passwordHash;  // store BCrypt hash

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public boolean isCustomer(){ return role == Role.CUSTOMER; }
}
