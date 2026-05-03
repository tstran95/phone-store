package com.phonestore.controller;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String sku;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private Long categoryId;
    private Long brandId;
    private BigDecimal basePrice;
    private BigDecimal salePrice;
    private BigDecimal costPrice;
    private Boolean isActive;
    private Boolean isFeatured;
    private List<VariantRequest> variants;
    private List<ImageRequest> images;

    @Data
    public static class VariantRequest {
        private String sku;
        private String variantName;
        private String attributes;
        private BigDecimal priceAdjustment;
        private Integer stockQuantity;
        private String imageUrl;
        private Boolean isActive;
    }

    @Data
    public static class ImageRequest {
        private String imageUrl;
        private String altText;
        private Boolean isPrimary;
        private Integer displayOrder;
    }
}
