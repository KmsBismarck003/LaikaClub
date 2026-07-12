package com.laikaclub.admin.service;

import com.laikaclub.admin.domain.Ad;
import com.laikaclub.admin.domain.AdClick;
import com.laikaclub.admin.dto.AdAdminDto;
import com.laikaclub.admin.dto.AdCreate;
import com.laikaclub.admin.dto.AdClickUserProjection;
import com.laikaclub.admin.dto.AdUpdate;
import com.laikaclub.admin.repository.AdClickRepository;
import com.laikaclub.admin.repository.AdRepository;
import com.laikaclub.admin.util.ImageUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdService {

    private static final Logger logger = LoggerFactory.getLogger(AdService.class);

    private final AdRepository adRepository;
    private final AdClickRepository adClickRepository;

    @Value("${uploads.ads-dir:uploads/ads}")
    private String adsUploadDirStr;

    @Autowired
    public AdService(AdRepository adRepository, AdClickRepository adClickRepository) {
        this.adRepository = adRepository;
        this.adClickRepository = adClickRepository;
    }

    public List<Ad> getPublicAds() {
        return adRepository.findPublicActiveAds();
    }

    public List<AdAdminDto> getAdminAds() {
        List<Ad> ads = adRepository.findAllByOrderByIdDesc();
        return ads.stream()
                .map(ad -> new AdAdminDto(ad, adClickRepository.countByAdId(ad.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public Ad createAd(AdCreate adCreate) {
        Ad ad = new Ad();
        ad.setTitle(adCreate.getTitle());
        ad.setImageUrl(adCreate.getImageUrl());
        ad.setLinkUrl(adCreate.getLinkUrl());
        ad.setPosition(adCreate.getPosition());
        ad.setActive(adCreate.isActive());
        ad.setEventId(adCreate.getEventId());
        return adRepository.save(ad);
    }

    @Transactional
    public Ad updateAd(Long adId, AdUpdate adUpdate) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anuncio no encontrado"));

        if (adUpdate.getTitle() != null) {
            ad.setTitle(adUpdate.getTitle());
        }
        if (adUpdate.getImageUrl() != null) {
            ad.setImageUrl(adUpdate.getImageUrl());
        }
        if (adUpdate.getLinkUrl() != null) {
            ad.setLinkUrl(adUpdate.getLinkUrl());
        }
        if (adUpdate.getPosition() != null) {
            ad.setPosition(adUpdate.getPosition());
        }
        if (adUpdate.getActive() != null) {
            ad.setActive(adUpdate.getActive());
        }
        if (adUpdate.getEventId() != null) {
            ad.setEventId(adUpdate.getEventId());
        }

        return adRepository.save(ad);
    }

    @Transactional
    public void deleteAd(Long adId) {
        if (!adRepository.existsById(adId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anuncio no encontrado");
        }
        adRepository.deleteById(adId);
    }

    @Transactional
    public void recordAdClick(Long adId, Long userId) {
        AdClick click = new AdClick(adId, userId);
        adClickRepository.save(click);
    }

    public List<AdClickUserProjection> getAdClicks(Long adId) {
        return adClickRepository.findClickUsersByAdId(adId);
    }

    public String saveAdImage(byte[] fileContents, String originalFilename) {
        try {
            Path destinationDir = Paths.get(adsUploadDirStr);
            Files.createDirectories(destinationDir);

            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }

            if (!List.of(".jpg", ".jpeg", ".png", ".webp", ".gif").contains(ext)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagen no permitido");
            }

            String filename;
            if (".gif".equals(ext)) {
                filename = UUID.randomUUID().toString().replace("-", "") + ext;
                Path filepath = destinationDir.resolve(filename);
                Files.write(filepath, fileContents);
            } else {
                filename = ImageUtils.saveImageAsWebp(fileContents, destinationDir, "");
            }

            return "/api/admin/uploads/ads/" + filename;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error al guardar imagen de anuncio", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al subir imagen: " + e.getMessage());
        }
    }
}
