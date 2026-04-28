package com.phonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {

    private Long id;
    private ProductSummary product;
    private LocalDateTime addedAt;
    private Boolean notifyWhenAvailable;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSummary {
        private Long id;
        private String name;
        private String slug;
        private String imageUrl;
        private BigDecimal basePrice;
        private BigDecimal salePrice;
        private Integer discountPercent;
        private Boolean inStock;
    }
}
