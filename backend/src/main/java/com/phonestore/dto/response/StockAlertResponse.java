package com.phonestore.dto.response;

import com.phonestore.entity.StockAlert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Long variantId;
    private String variantName;
    private StockAlert.AlertType alertType;
    private Integer thresholdValue;
    private Integer currentStock;
    private Boolean isResolved;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
    private LocalDateTime createdAt;
}
