package com.phonestore.dto.request;

import com.phonestore.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class CheckoutRequest {

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Shipping name is required")
    private String shippingName;

    @NotBlank(message = "Shipping phone is required")
    private String shippingPhone;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Shipping province is required")
    private String shippingProvince;

    @NotBlank(message = "Shipping district is required")
    private String shippingDistrict;

    @NotBlank(message = "Shipping ward is required")
    private String shippingWard;

    private String shippingMethod;
    private String customerNote;
    private String couponCode;

    // Cart items from frontend
    @NotEmpty(message = "Cart items are required")
    private List<CartItemRequest> items;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemRequest {
        private Long productId;
        private Long variantId;
        private String productName;
        private String productImage;
        private String variantName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
