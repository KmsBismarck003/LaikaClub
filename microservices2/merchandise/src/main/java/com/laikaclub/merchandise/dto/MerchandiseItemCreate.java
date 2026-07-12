package com.laikaclub.merchandise.dto;

import java.util.List;
import java.util.Map;

public class MerchandiseItemCreate {
    private String name;
    private String description;
    private String imageUrl;
    private String category;
    private boolean isOfficial = true;
    private double rating = 0.0;
    private String status = "draft";
    private String adminStatus = "pending_review";
    private Long eventId;
    private Map<String, Object> attributesSchema;
    private List<String> deliveryMethods;
    private int maxPerPerson = 5;
    private List<MerchandiseVariantCreate> variants;

    // Getters and Setters
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

    public List<MerchandiseVariantCreate> getVariants() {
        return variants;
    }

    public void setVariants(List<MerchandiseVariantCreate> variants) {
        this.variants = variants;
    }
}
