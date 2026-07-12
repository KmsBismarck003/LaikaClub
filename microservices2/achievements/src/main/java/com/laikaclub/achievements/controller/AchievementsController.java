package com.laikaclub.achievements.controller;

import com.laikaclub.achievements.config.UserPrincipal;
import com.laikaclub.achievements.domain.UserAchievement;
import com.laikaclub.achievements.domain.UserCoupon;
import com.laikaclub.achievements.dto.*;
import com.laikaclub.achievements.repository.UserCouponRepository;
import com.laikaclub.achievements.service.AchievementsService;
import com.laikaclub.achievements.service.IncentivesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/")
public class AchievementsController {

    private final AchievementsService achievementsService;
    private final IncentivesService incentivesService;
    private final UserCouponRepository couponRepository;

    @Autowired
    public AchievementsController(AchievementsService achievementsService,
                                  IncentivesService incentivesService,
                                  UserCouponRepository couponRepository) {
        this.achievementsService = achievementsService;
        this.incentivesService = incentivesService;
        this.couponRepository = couponRepository;
    }

    private Long getCurrentUserId(UserPrincipal principal, String xUserId) {
        if (principal != null) {
            return principal.getId();
        }
        if (xUserId != null && !xUserId.trim().isEmpty()) {
            try {
                return Long.parseLong(xUserId.trim());
            } catch (NumberFormatException ignored) {}
        }
        return 1L; // Fallback dummy ID for dev/testing
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "healthy", "service", "laika-achievements");
    }

    @GetMapping({"", "/my"})
    public ProgressResponse getProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long userId = getCurrentUserId(principal, xUserId);
        int ticketCount = achievementsService.getUserTicketCount(userId, authHeader);

        achievementsService.checkAchievementsLogic(userId, ticketCount);

        List<UserAchievement> unlocked = achievementsService.getUnlockedAchievements(userId);
        int userTier = 1;
        if (!unlocked.isEmpty()) {
            userTier = unlocked.stream().mapToInt(UserAchievement::getTier).max().orElse(1);
        }

        return new ProgressResponse(userId, ticketCount, userTier, unlocked);
    }

    @GetMapping("/coupons")
    public List<UserCoupon> getCoupons(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);

        // Run real-time check for this user to auto-incentivize
        incentivesService.checkAndGrantUserIncentivesRealtime(userId);

        List<UserCoupon> coupons = couponRepository.findActiveCouponsByUserId(userId);
        LocalDateTime now = LocalDateTime.now();

        List<UserCoupon> activeCoupons = new ArrayList<>();
        for (UserCoupon c : coupons) {
            if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(now)) {
                continue;
            }
            activeCoupons.add(c);
        }

        return activeCoupons;
    }

    @PostMapping("/coupons/validate")
    public CouponValidationResponse validateCoupon(
            @RequestBody ValidateCouponRequest data,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);
        Optional<UserCoupon> couponOpt = couponRepository.findByCodeAndUserId(data.getCouponCode(), userId);

        if (couponOpt.isEmpty()) {
            return CouponValidationResponse.invalid("Cupón no válido o no pertenece a tu usuario");
        }

        UserCoupon coupon = couponOpt.get();
        LocalDateTime now = LocalDateTime.now();

        // Check expiration
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
            return CouponValidationResponse.invalid("El cupón ha expirado");
        }

        // Check uses
        if (coupon.getIsPermanent() != 1 && coupon.getUsesLeft() <= 0) {
            return CouponValidationResponse.invalid("El cupón ya ha sido utilizado");
        }

        // Calculate discount
        double discount = 0.0;
        String type = coupon.getDiscountType();
        double val = coupon.getDiscountValue();
        double subtotal = data.getSubtotal();

        if ("percentage".equalsIgnoreCase(type)) {
            discount = Math.round(subtotal * (val / 100.0) * 100.0) / 100.0;
        } else if ("fixed".equalsIgnoreCase(type)) {
            discount = Math.round(Math.min(val, subtotal) * 100.0) / 100.0;
        } else if ("service_fee".equalsIgnoreCase(type)) {
            double fee = subtotal * (data.getServiceFeePercent() / 100.0);
            discount = Math.round(fee * (val / 100.0) * 100.0) / 100.0;
        }

        return CouponValidationResponse.valid(discount, type, val, coupon.getDescription());
    }

    @PostMapping("/coupons/consume")
    @Transactional
    public Map<String, Object> consumeCoupon(
            @RequestBody ConsumeCouponRequest data,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);
        Optional<UserCoupon> couponOpt = couponRepository.findByCodeAndUserId(data.getCouponCode(), userId);

        if (couponOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupón no encontrado o no válido");
        }

        UserCoupon coupon = couponOpt.get();
        LocalDateTime now = LocalDateTime.now();

        // Check expiration
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón ha expirado");
        }

        // Check uses
        if (coupon.getIsPermanent() != 1) {
            if (coupon.getUsesLeft() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cupón ya ha sido utilizado");
            }
            coupon.setUsesLeft(coupon.getUsesLeft() - 1);
            couponRepository.save(coupon);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("uses_left", coupon.getIsPermanent() == 1 ? "permanent" : coupon.getUsesLeft());
        return resp;
    }

    @PostMapping("/check")
    public Map<String, Object> manualCheck(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long userId = getCurrentUserId(principal, xUserId);
        int ticketCount = achievementsService.getUserTicketCount(userId, authHeader);
        achievementsService.checkAchievementsLogic(userId, ticketCount);

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("ticket_count", ticketCount);
        return resp;
    }

    @PostMapping("/run-incentives")
    public IncentivesResponse runIncentives(@RequestParam(value = "test_mode", defaultValue = "false") boolean testMode) {
        return incentivesService.runIncentives(testMode);
    }
}
