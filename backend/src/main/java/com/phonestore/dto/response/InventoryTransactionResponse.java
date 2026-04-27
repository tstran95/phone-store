package com.phonestore.dto.response;

import com.phonestore.enums.TransactionType;
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
public class InventoryTransactionResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Long variantId;
    private String variantName;
    private TransactionType transactionType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;
}
