package com.laikaclub.admin.controller;

import com.laikaclub.admin.domain.Ad;
import com.laikaclub.admin.dto.AdAdminDto;
import com.laikaclub.admin.dto.AdCreate;
import com.laikaclub.admin.dto.AdClickUserProjection;
import com.laikaclub.admin.dto.AdUpdate;
import com.laikaclub.admin.service.AdService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class AdsController {

    private final AdService adService;

    @Autowired
    public AdsController(AdService adService) {
        this.adService = adService;
    }

    @GetMapping("/ads/public")
    public ResponseEntity<List<Ad>> getPublicAds() {
        return ResponseEntity.ok(adService.getPublicAds());
    }

    @GetMapping("/ads/admin")
    public ResponseEntity<List<AdAdminDto>> getAdminAds() {
        return ResponseEntity.ok(adService.getAdminAds());
    }

    @PostMapping("/ads")
    public ResponseEntity<Ad> createAd(@Valid @RequestBody AdCreate adCreate) {
        return ResponseEntity.ok(adService.createAd(adCreate));
    }

    @PutMapping("/ads/{adId}")
    public ResponseEntity<Ad> updateAd(@PathVariable Long adId, @RequestBody AdUpdate adUpdate) {
        return ResponseEntity.ok(adService.updateAd(adId, adUpdate));
    }

    @DeleteMapping("/ads/{adId}")
    public ResponseEntity<Map<String, Boolean>> deleteAd(@PathVariable Long adId) {
        adService.deleteAd(adId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/ads/{adId}/click")
    public ResponseEntity<Map<String, Boolean>> recordClick(@PathVariable Long adId, @RequestBody(required = false) ClickRecord record) {
        Long userId = (record != null) ? record.getUserId() : null;
        adService.recordAdClick(adId, userId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/ads/{adId}/clicks")
    public ResponseEntity<List<AdClickUserProjection>> getAdClicks(@PathVariable Long adId) {
        return ResponseEntity.ok(adService.getAdClicks(adId));
    }

    @PostMapping("/ads/upload")
    public ResponseEntity<Map<String, String>> uploadAdImage(@RequestParam("file") MultipartFile file) throws IOException {
        String url = adService.saveAdImage(file.getBytes(), file.getOriginalFilename());
        
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("message", "Imagen subida correctamente");
        return ResponseEntity.ok(response);
    }

    public static class ClickRecord {
        private Long userId;

        public ClickRecord() {}

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
}
