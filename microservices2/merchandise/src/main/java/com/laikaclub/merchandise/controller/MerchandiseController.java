package com.laikaclub.merchandise.controller;

import com.laikaclub.merchandise.config.UserPrincipal;
import com.laikaclub.merchandise.domain.*;
import com.laikaclub.merchandise.dto.*;
import com.laikaclub.merchandise.service.MerchandiseService;
import com.laikaclub.merchandise.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/")
public class MerchandiseController {

    private final MerchandiseService service;
    private final TokenService tokenService;

    @Autowired
    public MerchandiseController(MerchandiseService service, TokenService tokenService) {
        this.service = service;
        this.tokenService = tokenService;
    }

    private Long getCurrentUserId(UserPrincipal principal, String xUserId) {
        if (principal != null) {
            return principal.getId();
        }
        if (xUserId != null && !xUserId.trim().isEmpty()) {
            try {
                return Long.parseLong(xUserId);
            } catch (NumberFormatException ignored) {}
        }
        return 1L; // Fallback dummy ID for dev
    }

    private String getCurrentRole(UserPrincipal principal, String xUserRole) {
        if (principal != null) {
            return principal.getRole();
        }
        if (xUserRole != null && !xUserRole.trim().isEmpty()) {
            return xUserRole;
        }
        return "gestor"; // Fallback dummy role
    }

    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        Map<String, String> resp = new HashMap<>();
        resp.put("status", "ok");
        resp.put("service", "merchandise_v2");
        return resp;
    }

    @PostMapping
    public MerchandiseItemResponse createMerchandise(
            @RequestBody MerchandiseItemCreate item,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        String role = getCurrentRole(principal, xUserRole);
        Long userId = getCurrentUserId(principal, xUserId);

        if (!"gestor".equals(role) && !"admin".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only managers / admins can create merchandise.");
        }

        MerchandiseItem created = service.createMerchandise(item, userId);
        return mapToItemResponse(created);
    }

    @GetMapping
    public List<MerchandiseItemResponse> getAllMerchandise(
            @RequestParam(value = "manager_id", required = false) Long managerId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "event_id", required = false) Long eventId,
            @RequestParam(value = "admin_status", required = false) String adminStatus) {

        List<MerchandiseItem> items = service.getAllMerchandise(managerId, status, eventId, adminStatus);
        return items.stream().map(this::mapToItemResponse).toList();
    }

    @GetMapping("/{merchId}")
    public MerchandiseItemResponse getMerchandise(@PathVariable("merchId") Long merchId) {
        MerchandiseItem item = service.getMerchandiseItem(merchId);
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found");
        }
        return mapToItemResponse(item);
    }

    @PutMapping("/{merchId}")
    public MerchandiseItemResponse updateMerchandise(
            @PathVariable("merchId") Long merchId,
            @RequestBody MerchandiseItemUpdate item,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);
        MerchandiseItem updated = service.updateMerchandise(merchId, item, userId);
        return mapToItemResponse(updated);
    }

    @DeleteMapping("/{merchId}")
    public Map<String, String> deleteMerchandise(
            @PathVariable("merchId") Long merchId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);
        service.deleteMerchandise(merchId, userId);

        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Merchandise deleted successfully");
        return resp;
    }

    @PutMapping("/{merchId}/admin_status")
    public MerchandiseItemResponse updateAdminStatus(
            @PathVariable("merchId") Long merchId,
            @RequestBody MerchandiseItemUpdate statusUpdate,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        String role = getCurrentRole(principal, xUserRole);
        if (!"admin".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can update admin status.");
        }

        if (statusUpdate.getAdminStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "admin_status field is required.");
        }

        MerchandiseItem updated = service.updateAdminStatus(merchId, statusUpdate.getAdminStatus());
        return mapToItemResponse(updated);
    }

    @GetMapping("/settings/{managerId}")
    public MerchandiseSettingsResponse getSettings(@PathVariable("managerId") Long managerId) {
        MerchandiseSettings s = service.getSettings(managerId);
        return mapToSettingsResponse(s);
    }

    @PutMapping("/settings/{managerId}")
    public MerchandiseSettingsResponse updateSettings(
            @PathVariable("managerId") Long managerId,
            @RequestBody MerchandiseSettingsBase settings,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {

        String role = getCurrentRole(principal, xUserRole);
        if (!"admin".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can update settings.");
        }

        MerchandiseSettings updated = service.updateSettings(managerId, settings);
        return mapToSettingsResponse(updated);
    }

    @PostMapping("/orders/")
    public OrderResponse createOrder(@RequestBody OrderCreate order) {
        MerchandiseOrder created = service.createOrder(order);
        return mapToOrderResponse(created);
    }

    @GetMapping("/orders/{orderId}")
    public OrderResponse getOrder(@PathVariable("orderId") Long orderId) {
        MerchandiseOrder o = service.getOrder(orderId);
        return mapToOrderResponse(o);
    }

    @PostMapping("/reviews/")
    public MerchandiseReviewResponse createReview(
            @RequestBody MerchandiseReviewCreate review,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long userId = getCurrentUserId(principal, xUserId);
        
        String userName = "Usuario";
        if (principal != null) {
            String first = tokenService.getFirstNameFromToken(authHeader.substring(7).trim());
            String last = tokenService.getLastNameFromToken(authHeader.substring(7).trim());
            String email = principal.getEmail();
            
            String fullName = ((first != null ? first : "") + " " + (last != null ? last : "")).trim();
            if (!fullName.isEmpty()) {
                userName = fullName;
            } else if (email != null) {
                userName = email.split("@")[0];
            }
        }

        MerchandiseReview created = service.createReview(review, userId, userName);
        return mapToReviewResponse(created);
    }

    @GetMapping("/{merchId}/purchased")
    public Map<String, Boolean> checkPurchased(
            @PathVariable("merchId") Long merchId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {

        Long userId = getCurrentUserId(principal, xUserId);
        boolean purchased = service.checkPurchased(merchId, userId);

        Map<String, Boolean> resp = new HashMap<>();
        resp.put("purchased", purchased);
        return resp;
    }

    // Mapping helper methods
    private MerchandiseReviewResponse mapToReviewResponse(MerchandiseReview r) {
        MerchandiseReviewResponse res = new MerchandiseReviewResponse();
        res.setId(r.getId());
        res.setItemId(r.getItem().getId());
        res.setUserId(r.getUserId());
        res.setUserName(r.getUserName());
        res.setRating(r.getRating());
        res.setComment(r.getComment());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }

    private MerchandiseVariantResponse mapToVariantResponse(MerchandiseVariant v) {
        MerchandiseVariantResponse res = new MerchandiseVariantResponse();
        res.setId(v.getId());
        res.setItemId(v.getItem().getId());
        res.setSku(v.getSku());
        res.setAttributes(v.getAttributes());
        res.setPrice(v.getPrice());
        res.setStock(v.getStock());
        res.setIsActive(v.isActive());
        return res;
    }

    private MerchandiseItemResponse mapToItemResponse(MerchandiseItem item) {
        MerchandiseItemResponse res = new MerchandiseItemResponse();
        res.setId(item.getId());
        res.setName(item.getName());
        res.setDescription(item.getDescription());
        res.setImageUrl(item.getImageUrl());
        res.setManagerId(item.getManagerId());
        res.setCategory(item.getCategory());
        res.setIsOfficial(item.isOfficial());
        res.setRating(item.getRating());
        res.setStatus(item.getStatus());
        res.setAdminStatus(item.getAdminStatus());
        res.setEventId(item.getEventId());
        res.setAttributesSchema(item.getAttributesSchema());
        res.setDeliveryMethods(item.getDeliveryMethods());
        res.setMaxPerPerson(item.getMaxPerPerson());
        res.setCreatedAt(item.getCreatedAt());

        if (item.getVariants() != null) {
            res.setVariants(item.getVariants().stream().map(this::mapToVariantResponse).toList());
        } else {
            res.setVariants(new ArrayList<>());
        }

        if (item.getReviews() != null) {
            res.setReviews(item.getReviews().stream().map(this::mapToReviewResponse).toList());
        } else {
            res.setReviews(new ArrayList<>());
        }

        return res;
    }

    private MerchandiseSettingsResponse mapToSettingsResponse(MerchandiseSettings s) {
        MerchandiseSettingsResponse res = new MerchandiseSettingsResponse();
        res.setManagerId(s.getManagerId());
        res.setIsEnabled(s.isEnabled());
        res.setActivationFeePaid(s.isActivationFeePaid());
        res.setCommissionPercentage(s.getCommissionPercentage());
        res.setEnabledAt(s.getEnabledAt());
        return res;
    }

    private OrderResponse mapToOrderResponse(MerchandiseOrder o) {
        OrderResponse res = new OrderResponse();
        res.setId(o.getId());
        res.setUserId(o.getUserId());
        res.setTotalAmount(o.getTotalAmount());
        res.setStatus(o.getStatus());
        res.setCreatedAt(o.getCreatedAt());
        return res;
    }
}
