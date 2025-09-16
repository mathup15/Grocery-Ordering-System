package org.orderingsystem.grocerryorderingsystem.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.Role;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.orderingsystem.grocerryorderingsystem.repository.UserRepository;
import org.orderingsystem.grocerryorderingsystem.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder enc;
    private final JwtService jwt;

    /** Customers can self-register (others sign in only) */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterReq req){
        if (users.findByUsername(req.username).isPresent())
            return ResponseEntity.badRequest().body(new ApiError("Username already exists"));

        String nextId = "CUS-" + System.currentTimeMillis();

        User u = User.builder()
                .uniqueId(nextId)
                .username(req.username)
                .fullName(req.fullName)
                .phone(req.phone)
                .passwordHash(enc.encode(req.password))
                .role(Role.CUSTOMER)
                .build();
        users.save(u);
        return ResponseEntity.ok(new ApiMsg("Customer account created. Please sign in."));
    }

    /** Sign in with either Unique ID (staff/admin/etc.) or username/email (customers) */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReq req){
        User u = users.findByUniqueId(req.identifier)
                .or(() -> users.findByUsername(req.identifier))
                .orElse(null);

        if (u == null || !enc.matches(req.password, u.getPasswordHash()))
            return ResponseEntity.status(401).body(new ApiError("Invalid credentials"));

        String token = jwt.generateToken(u.getUniqueId(), u.getRole().name());
        return ResponseEntity.ok(new LoginResp(token, u.getRole().name()));
    }

    // DTOs
    @Data static class RegisterReq { String fullName; String phone; String username; String password; }
    @Data static class LoginReq { String identifier; String password; }

    public record LoginResp(String token, String role) {}
    public record ApiError(String error) {}
    public record ApiMsg(String message) {}
}
