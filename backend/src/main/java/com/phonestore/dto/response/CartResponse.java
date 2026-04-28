package com.phonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {

    private String cartId;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String couponCode;
    private BigDecimal finalTotal;
    private List<CartItemResponse> items;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
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
}
