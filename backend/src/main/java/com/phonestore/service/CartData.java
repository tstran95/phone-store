package com.phonestore.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CartData {
    private String cartId;
    private Long userId;
    private String sessionId;
    private List<CartItem> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String couponCode;
}
