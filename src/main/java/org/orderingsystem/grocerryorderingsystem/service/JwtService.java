package org.orderingsystem.grocerryorderingsystem.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    public String generateToken(String subjectUniqueId, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subjectUniqueId)
                .claim("role", role)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 1000L * 60 * 60 * 8)) // 8 hours
                .signWith(key)
                .compact();
    }
}
