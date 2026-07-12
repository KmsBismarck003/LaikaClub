package com.laikaclub.merchandise.dto;

import java.util.List;
import java.util.Map;

public class MerchandiseItemUpdate {
    private String name;
    private String description;
    private String imageUrl;
    private String status;
    private String adminStatus;
    private Long eventId;
    private Map<String, Object> attributesSchema;
    private List<String> deliveryMethods;
    private Integer maxPerPerson;
    private List<MerchandiseVariantUpdate> variants;

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

    public Integer getMaxPerPerson() {
        return maxPerPerson;
    }

    public void setMaxPerPerson(Integer maxPerPerson) {
        this.maxPerPerson = maxPerPerson;
    }

    public List<MerchandiseVariantUpdate> getVariants() {
        return variants;
    }

    public void setVariants(List<MerchandiseVariantUpdate> variants) {
        this.variants = variants;
    }
}
