package com.laikaclub.merchandise.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class MerchandiseItemResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long managerId;
    private String category;
    private boolean isOfficial;
    private double rating;
    private String status;
    private String adminStatus;
    private Long eventId;
    private Map<String, Object> attributesSchema;
    private List<String> deliveryMethods;
    private int maxPerPerson;
    private LocalDateTime createdAt;
    private List<MerchandiseVariantResponse> variants;
    private List<MerchandiseReviewResponse> reviews;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isIsOfficial() {
        return isOfficial;
    }

    public void setIsOfficial(boolean isOfficial) {
        this.isOfficial = isOfficial;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminStatus() {
        return adminStatus;
    }

    public void setAdminStatus(String adminStatus) {
        this.adminStatus = adminStatus;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Map<String, Object> getAttributesSchema() {
        return attributesSchema;
    }

    public void setAttributesSchema(Map<String, Object> attributesSchema) {
        this.attributesSchema = attributesSchema;
    }

    public List<String> getDeliveryMethods() {
        return deliveryMethods;
    }

    public void setDeliveryMethods(List<String> deliveryMethods) {
        this.deliveryMethods = deliveryMethods;
    }

    public int getMaxPerPerson() {
        return maxPerPerson;
    }

    public void setMaxPerPerson(int maxPerPerson) {
        this.maxPerPerson = maxPerPerson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<MerchandiseVariantResponse> getVariants() {
        return variants;
    }

    public void setVariants(List<MerchandiseVariantResponse> variants) {
        this.variants = variants;
    }

    public List<MerchandiseReviewResponse> getReviews() {
        return reviews;
    }

    public void setReviews(List<MerchandiseReviewResponse> reviews) {
        this.reviews = reviews;
    }
}
