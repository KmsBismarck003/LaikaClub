package com.laikaclub.achievements.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class TokenService {

    @Value("${jwt.secret:super_secret_laika_club_2026}")
    private String jwtSecret;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] paddedBytes = new byte[32];
            System.arraycopy(keyBytes, 0, paddedBytes, 0, keyBytes.length);
            return Keys.hmacShaKeyFor(paddedBytes);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        return parseToken(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Number userId = parseToken(token).get("user_id", Number.class);
        if (userId == null) {
            userId = parseToken(token).get("id", Number.class);
        }
        return userId != null ? userId.longValue() : null;
    }

    public String getRoleFromToken(String token) {
        return parseToken(token).get("role", String.class);
    }
}
