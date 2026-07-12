package com.laikaclub.merchandise.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.laikaclub.merchandise.domain.converter.ListStringConverter;
import com.laikaclub.merchandise.domain.converter.MapConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "merchandise_items")
public class MerchandiseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    private String category;

    @Column(name = "is_official")
    private boolean isOfficial = true;

    private Double rating = 0.0;

    private String status = "draft";

    @Column(name = "admin_status")
    private String adminStatus = "pending_review";

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "attributes_schema", columnDefinition = "TEXT")
    @Convert(converter = MapConverter.class)
    private Map<String, Object> attributesSchema;

    @Column(name = "delivery_methods", columnDefinition = "TEXT")
    @Convert(converter = ListStringConverter.class)
    private List<String> deliveryMethods;

    @Column(name = "max_per_person")
    private Integer maxPerPerson = 5;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<MerchandiseVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<MerchandiseReview> reviews = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    public boolean isOfficial() {
        return isOfficial;
    }

    public void setOfficial(boolean official) {
        isOfficial = official;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
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

    public Integer getMaxPerPerson() {
        return maxPerPerson;
    }

    public void setMaxPerPerson(Integer maxPerPerson) {
        this.maxPerPerson = maxPerPerson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<MerchandiseVariant> getVariants() {
        return variants;
    }

    public void setVariants(List<MerchandiseVariant> variants) {
        this.variants = variants;
    }

    public List<MerchandiseReview> getReviews() {
        return reviews;
    }

    public void setReviews(List<MerchandiseReview> reviews) {
        this.reviews = reviews;
    }
}
