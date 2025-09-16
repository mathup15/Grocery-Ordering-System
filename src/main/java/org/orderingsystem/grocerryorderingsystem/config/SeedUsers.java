package org.orderingsystem.grocerryorderingsystem.config;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.Role;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.orderingsystem.grocerryorderingsystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class SeedUsers {

    @Bean
    CommandLineRunner seed(UserRepository repo, PasswordEncoder enc){
        return args -> {
            if (repo.findByUniqueId("ADM-1001").isEmpty()) {
                repo.save(User.builder()
                        .uniqueId("ADM-1001").username("admin@piomart.lk")
                        .fullName("System Admin").passwordHash(enc.encode("Admin@123"))
                        .role(Role.ADMIN).build());
            }
            if (repo.findByUniqueId("STF-2001").isEmpty()) {
                repo.save(User.builder()
                        .uniqueId("STF-2001").username("staff@piomart.lk")
                        .fullName("Store Staff").passwordHash(enc.encode("Staff@123"))
                        .role(Role.STAFF).build());
            }
            if (repo.findByUniqueId("DLV-3001").isEmpty()) {
                repo.save(User.builder()
                        .uniqueId("DLV-3001").username("delivery@piomart.lk")
                        .fullName("Delivery Rider").passwordHash(enc.encode("Delivery@123"))
                        .role(Role.DELIVERY).build());
            }
            if (repo.findByUniqueId("MGR-4001").isEmpty()) {
                repo.save(User.builder()
                        .uniqueId("MGR-4001").username("manager@piomart.lk")
                        .fullName("Store Manager").passwordHash(enc.encode("Manager@123"))
                        .role(Role.MANAGER).build());
            }
        };
    }
}
