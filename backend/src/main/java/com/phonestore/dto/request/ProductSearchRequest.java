package com.phonestore.dto.request;

import com.phonestore.enums.ProductSortField;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSearchRequest {

    private String keyword;
    private Long categoryId;
    private Long brandId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Double minRating;
    private Boolean isFeatured;
    private Boolean hasDiscount;
    private ProductSortField sortBy;
    private String sortDirection = "desc";
    private Integer page = 0;
    private Integer size = 20;
}
