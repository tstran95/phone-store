package com.phonestore.dto.response;

import com.phonestore.enums.PaymentMethod;
import com.phonestore.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private String orderNumber;
    private String transactionId;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String providerTransactionId;
    private String errorMessage;
    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

    // For redirect-based payments
    private String paymentUrl;
    private String qrCodeUrl;
}
