package com.laikaclub.gateway.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CacheService {

    private static final Logger logger = LoggerFactory.getLogger(CacheService.class);

    private static class CacheEntry {
        final ResponseEntity<byte[]> response;
        final long expiresAt;

        CacheEntry(ResponseEntity<byte[]> response, long ttlMs) {
            this.response = response;
            this.expiresAt = System.currentTimeMillis() + ttlMs;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 60000; // 60 seconds cache TTL

    public ResponseEntity<byte[]> get(String url) {
        CacheEntry entry = cache.get(url);
        if (entry != null) {
            if (!entry.isExpired()) {
                logger.info("[GATEWAY CACHE] HIT: {}", url);
                return entry.response;
            } else {
                logger.debug("[GATEWAY CACHE] EXPIRED: {}", url);
                cache.remove(url);
            }
        }
        return null;
    }

    public void put(String url, ResponseEntity<byte[]> response) {
        logger.info("[GATEWAY CACHE] PUT: {}", url);
        cache.put(url, new CacheEntry(response, CACHE_TTL_MS));
    }

    public void clear() {
        logger.info("[GATEWAY CACHE] CLEARED");
        cache.clear();
    }
}
