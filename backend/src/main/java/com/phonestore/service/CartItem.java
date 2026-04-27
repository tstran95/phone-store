package com.phonestore.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CartItem {
    private String itemId;
    private Long productId;
    private Long variantId;
    private String productName;
    private String productSlug;
    private String productImage;
    private String variantName;
    private Integer quantity;
    private Integer maxQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private boolean available;
}
