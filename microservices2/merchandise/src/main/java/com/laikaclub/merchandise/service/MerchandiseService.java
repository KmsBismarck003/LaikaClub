package com.laikaclub.merchandise.service;

import com.laikaclub.merchandise.domain.*;
import com.laikaclub.merchandise.dto.*;
import com.laikaclub.merchandise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class MerchandiseService {

    private static final Logger logger = LoggerFactory.getLogger(MerchandiseService.class);

    private final MerchandiseItemRepository itemRepository;
    private final MerchandiseVariantRepository variantRepository;
    private final MerchandiseSettingsRepository settingsRepository;
    private final MerchandiseOrderRepository orderRepository;
    private final MerchandiseOrderItemRepository orderItemRepository;
    private final MerchandiseReviewRepository reviewRepository;
    private final MongoSyncService mongoSyncService;
    private final RestTemplate restTemplate;

    @Value("${services.events.url}")
    private String eventServiceUrl;

    @Autowired
    public MerchandiseService(MerchandiseItemRepository itemRepository,
                              MerchandiseVariantRepository variantRepository,
                              MerchandiseSettingsRepository settingsRepository,
                              MerchandiseOrderRepository orderRepository,
                              MerchandiseOrderItemRepository orderItemRepository,
                              MerchandiseReviewRepository reviewRepository,
                              MongoSyncService mongoSyncService) {
        this.itemRepository = itemRepository;
        this.variantRepository = variantRepository;
        this.settingsRepository = settingsRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.reviewRepository = reviewRepository;
        this.mongoSyncService = mongoSyncService;
        this.restTemplate = new RestTemplate();
    }

    public MerchandiseItem getMerchandiseItem(Long merchId) {
        return itemRepository.findById(merchId).orElse(null);
    }

    public List<MerchandiseItem> getAllMerchandise(Long managerId, String status, Long eventId, String adminStatus) {
        return itemRepository.findAllWithFilters(managerId, status, eventId, adminStatus);
    }

    @Transactional
    public MerchandiseItem createMerchandise(MerchandiseItemCreate itemData, Long managerId) {
        boolean eventAllowed = false;
        if (itemData.getEventId() != null) {
            try {
                Map<?, ?> eventData = restTemplate.getForObject(eventServiceUrl + "/" + itemData.getEventId(), Map.class);
                if (eventData != null && Boolean.TRUE.equals(eventData.get("merch_enabled"))) {
                    eventAllowed = true;
                }
            } catch (Exception e) {
                logger.error("[MERCH SERVICE] Error checking event merch_enabled: {}", e.getMessage());
            }
        }

        MerchandiseSettings settings = getSettings(managerId);

        if (!eventAllowed) {
            if (settings == null || !settings.isEnabled()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Store is not enabled for this manager.");
            }
        }

        MerchandiseItem item = new MerchandiseItem();
        item.setName(itemData.getName());
        item.setDescription(itemData.getDescription());
        item.setImageUrl(itemData.getImageUrl());
        item.setManagerId(managerId);
        item.setCategory(itemData.getCategory());
        item.setOfficial(itemData.isIsOfficial());
        item.setRating(itemData.getRating());
        item.setStatus(itemData.getStatus());
        item.setAdminStatus(itemData.getAdminStatus());
        item.setEventId(itemData.getEventId());
        item.setAttributesSchema(itemData.getAttributesSchema());
        item.setDeliveryMethods(itemData.getDeliveryMethods());
        item.setMaxPerPerson(itemData.getMaxPerPerson());

        item = itemRepository.save(item);

        if (itemData.getVariants() != null) {
            for (MerchandiseVariantCreate vDto : itemData.getVariants()) {
                MerchandiseVariant variant = new MerchandiseVariant();
                variant.setItem(item);
                variant.setSku(vDto.getSku());
                variant.setAttributes(vDto.getAttributes());
                variant.setPrice(vDto.getPrice());
                variant.setStock(vDto.getStock());
                variant.setActive(vDto.isIsActive());
                variantRepository.save(variant);
                item.getVariants().add(variant);
            }
        }

        return item;
    }

    @Transactional
    public MerchandiseItem updateMerchandise(Long merchId, MerchandiseItemUpdate itemUpdate, Long managerId) {
        MerchandiseItem item = itemRepository.findById(merchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found."));

        if (!item.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found or not owned by manager.");
        }

        if (itemUpdate.getName() != null) item.setName(itemUpdate.getName());
        if (itemUpdate.getDescription() != null) item.setDescription(itemUpdate.getDescription());
        if (itemUpdate.getImageUrl() != null) item.setImageUrl(itemUpdate.getImageUrl());
        if (itemUpdate.getStatus() != null) item.setStatus(itemUpdate.getStatus());
        if (itemUpdate.getAdminStatus() != null) item.setAdminStatus(itemUpdate.getAdminStatus());
        if (itemUpdate.getEventId() != null) item.setEventId(itemUpdate.getEventId());
        if (itemUpdate.getAttributesSchema() != null) item.setAttributesSchema(itemUpdate.getAttributesSchema());
        if (itemUpdate.getDeliveryMethods() != null) item.setDeliveryMethods(itemUpdate.getDeliveryMethods());
        if (itemUpdate.getMaxPerPerson() != null) item.setMaxPerPerson(itemUpdate.getMaxPerPerson());

        if (itemUpdate.getVariants() != null) {
            List<Long> sentIds = new ArrayList<>();
            for (MerchandiseVariantUpdate vUpdate : itemUpdate.getVariants()) {
                if (vUpdate.getId() != null) {
                    sentIds.add(vUpdate.getId());
                }
            }

            // Delete database variants not sent in update payload
            List<MerchandiseVariant> currentVariants = new ArrayList<>(item.getVariants());
            for (MerchandiseVariant current : currentVariants) {
                if (!sentIds.contains(current.getId())) {
                    item.getVariants().remove(current);
                    variantRepository.delete(current);
                }
            }

            for (MerchandiseVariantUpdate vUpdate : itemUpdate.getVariants()) {
                if (vUpdate.getId() != null) {
                    // Update existing
                    MerchandiseVariant variant = variantRepository.findById(vUpdate.getId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant " + vUpdate.getId() + " not found."));
                    
                    if (!variant.getItem().getId().equals(item.getId())) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant does not belong to this merchandise.");
                    }

                    if (vUpdate.getSku() != null) variant.setSku(vUpdate.getSku());
                    if (vUpdate.getAttributes() != null) variant.setAttributes(vUpdate.getAttributes());
                    if (vUpdate.getPrice() != null) variant.setPrice(vUpdate.getPrice());
                    if (vUpdate.getStock() != null) variant.setStock(vUpdate.getStock());
                    if (vUpdate.getIsActive() != null) variant.setActive(vUpdate.getIsActive());

                    variantRepository.save(variant);
                } else {
                    // Create new
                    MerchandiseVariant variant = new MerchandiseVariant();
                    variant.setItem(item);
                    variant.setSku(vUpdate.getSku());
                    variant.setAttributes(vUpdate.getAttributes());
                    variant.setPrice(vUpdate.getPrice() != null ? vUpdate.getPrice() : BigDecimal.ZERO);
                    variant.setStock(vUpdate.getStock() != null ? vUpdate.getStock() : 0);
                    variant.setActive(vUpdate.getIsActive() != null ? vUpdate.getIsActive() : true);
                    variantRepository.save(variant);
                    item.getVariants().add(variant);
                }
            }
        }

        return itemRepository.save(item);
    }

    @Transactional
    public void deleteMerchandise(Long merchId, Long managerId) {
        MerchandiseItem item = itemRepository.findById(merchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found."));

        if (!item.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found or not owned by manager.");
        }

        itemRepository.delete(item);
    }

    @Transactional
    public MerchandiseItem updateAdminStatus(Long merchId, String adminStatus) {
        MerchandiseItem item = itemRepository.findById(merchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchandise not found."));

        item.setAdminStatus(adminStatus);
        if ("approved".equals(adminStatus)) {
            item.setStatus("published");
        } else if ("rejected".equals(adminStatus)) {
            item.setStatus("hidden");
        }

        return itemRepository.save(item);
    }

    @Transactional
    public MerchandiseSettings getSettings(Long managerId) {
        return settingsRepository.findById(managerId).orElseGet(() -> {
            MerchandiseSettings s = new MerchandiseSettings();
            s.setManagerId(managerId);
            return settingsRepository.save(s);
        });
    }

    @Transactional
    public MerchandiseSettings updateSettings(Long managerId, MerchandiseSettingsBase settingsUpdate) {
        MerchandiseSettings s = getSettings(managerId);
        s.setEnabled(settingsUpdate.isIsEnabled());
        s.setActivationFeePaid(settingsUpdate.isActivationFeePaid());
        s.setCommissionPercentage(settingsUpdate.getCommissionPercentage());

        if (settingsUpdate.isIsEnabled() && s.getEnabledAt() == null) {
            s.setEnabledAt(LocalDateTime.now());
        }

        return settingsRepository.save(s);
    }

    @Transactional
    public MerchandiseOrder createOrder(OrderCreate order) {
        // Idempotency check
        if (order.getIdempotencyKey() != null && !order.getIdempotencyKey().trim().isEmpty()) {
            Optional<MerchandiseOrder> existing = orderRepository.findByIdempotencyKey(order.getIdempotencyKey());
            if (existing.isPresent()) {
                logger.info("[IDEMPOTENCY] Order {} already processed for key {}", existing.get().getId(), order.getIdempotencyKey());
                return existing.get();
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal netAmount = BigDecimal.ZERO;

        List<MerchandiseOrderItem> orderItems = new ArrayList<>();

        for (OrderItemCreate itemDto : order.getItems()) {
            // Pessimistic Write Lock
            MerchandiseVariant variant = variantRepository.findByIdForUpdate(itemDto.getVariantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant " + itemDto.getVariantId() + " not found."));

            if (variant.getStock() < itemDto.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock for variant " + itemDto.getVariantId() + ".");
            }

            MerchandiseItem merchItem = variant.getItem();

            // max_per_person validation
            Integer previousQty = orderItemRepository.sumQuantityByUserIdAndVariantId(order.getUserId(), itemDto.getVariantId());
            if (previousQty + itemDto.getQuantity() > merchItem.getMaxPerPerson()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limit exceeded. Max " + merchItem.getMaxPerPerson() + " items per person allowed.");
            }

            // Check if store / event allows sales
            MerchandiseSettings settings = getSettings(merchItem.getManagerId());
            boolean eventAllowed = false;
            if (merchItem.getEventId() != null) {
                try {
                    Map<?, ?> eventData = restTemplate.getForObject(eventServiceUrl + "/" + merchItem.getEventId(), Map.class);
                    if (eventData != null && Boolean.TRUE.equals(eventData.get("merch_enabled"))) {
                        eventAllowed = true;
                    }
                } catch (Exception e) {
                    logger.error("[MERCH SERVICE] Error checking event merch_enabled for order: {}", e.getMessage());
                }
            }

            if (!eventAllowed && !settings.isEnabled()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store not enabled for merchandise " + merchItem.getId() + ".");
            }

            BigDecimal unitPrice = variant.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            BigDecimal commissionRate = settings.getCommissionPercentage().divide(new BigDecimal("100.00"), 4, RoundingMode.HALF_UP);
            BigDecimal itemCommission = itemTotal.multiply(commissionRate);
            BigDecimal itemNet = itemTotal.subtract(itemCommission);

            totalAmount = totalAmount.add(itemTotal);
            totalCommission = totalCommission.add(itemCommission);
            netAmount = netAmount.add(itemNet);

            // Deduct stock
            variant.setStock(variant.getStock() - itemDto.getQuantity());
            variantRepository.save(variant);

            MerchandiseOrderItem orderItem = new MerchandiseOrderItem();
            orderItem.setVariantId(variant.getId());
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItems.add(orderItem);
        }

        MerchandiseOrder dbOrder = new MerchandiseOrder();
        dbOrder.setUserId(order.getUserId());
        dbOrder.setTotalAmount(totalAmount);
        dbOrder.setTotalCommission(totalCommission);
        dbOrder.setNetAmount(netAmount);
        dbOrder.setStatus("completed");
        dbOrder.setPaymentMethod(order.getPaymentMethod());
        dbOrder.setIdempotencyKey(order.getIdempotencyKey());

        dbOrder = orderRepository.save(dbOrder);

        for (MerchandiseOrderItem oi : orderItems) {
            oi.setOrder(dbOrder);
            orderItemRepository.save(oi);
            dbOrder.getItems().add(oi);
        }

        // MongoDB Sync (fire-and-forget)
        try {
            List<Map<String, Object>> itemsSummary = new ArrayList<>();
            for (MerchandiseOrderItem oi : dbOrder.getItems()) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("variant_id", oi.getVariantId());
                itemMap.put("quantity", oi.getQuantity());
                itemsSummary.add(itemMap);
            }

            Map<String, Object> syncData = new HashMap<>();
            syncData.put("order_id", dbOrder.getId());
            syncData.put("user_id", dbOrder.getUserId());
            syncData.put("total_amount", dbOrder.getTotalAmount().doubleValue());
            syncData.put("total_commission", dbOrder.getTotalCommission().doubleValue());
            syncData.put("net_amount", dbOrder.getNetAmount().doubleValue());
            syncData.put("payment_method", dbOrder.getPaymentMethod());
            syncData.put("status", "completed");
            syncData.put("purchase_date", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            syncData.put("items", itemsSummary);
            syncData.put("type", "merchandise_purchase");

            mongoSyncService.syncPurchaseToMongo(syncData);
            logger.info("[MONGO-SYNC] Merchandise order {} scheduled for Mongo synchronization.", dbOrder.getId());
        } catch (Exception e) {
            logger.error("[MONGO-SYNC] Error scheduling merchandise order for Mongo sync: {}", e.getMessage());
        }

        return dbOrder;
    }

    public MerchandiseOrder getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public MerchandiseReview createReview(MerchandiseReviewCreate reviewData, Long userId, String userName) {
        MerchandiseItem item = itemRepository.findById(reviewData.getItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        boolean purchased = orderItemRepository.existsByUserIdAndMerchandiseId(userId, reviewData.getItemId());
        if (!purchased) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes comprar este producto para poder calificarlo.");
        }

        MerchandiseReview review = new MerchandiseReview();
        review.setItem(item);
        review.setUserId(userId);
        review.setUserName(userName);
        review.setRating(reviewData.getRating());
        review.setComment(reviewData.getComment());

        review = reviewRepository.save(review);
        item.getReviews().add(review);

        // Recalculate average rating
        Double avgRating = reviewRepository.getAverageRatingByItemId(reviewData.getItemId());
        if (avgRating != null) {
            // Round to 1 decimal place
            BigDecimal rounded = BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP);
            item.setRating(rounded.doubleValue());
            itemRepository.save(item);
        }

        return review;
    }

    public boolean checkPurchased(Long merchId, Long userId) {
        return orderItemRepository.existsByUserIdAndMerchandiseId(userId, merchId);
    }
}
