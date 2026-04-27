package com.phonestore.service;

import com.phonestore.dto.response.PaymentResponse;
import com.phonestore.entity.Order;
import com.phonestore.entity.Payment;
import com.phonestore.enums.OrderStatus;
import com.phonestore.enums.PaymentStatus;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Payment createPayment(Order order) {
        String transactionId = generateTransactionId();

        Payment payment = Payment.builder()
                .order(order)
                .user(order.getUser())
                .transactionId(transactionId)
                .paymentMethod(order.getPaymentMethod())
                .amount(order.getTotalAmount())
                .currency("VND")
                .status(PaymentStatus.PENDING)
                .initiatedAt(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse processPaymentSuccess(String transactionId, String providerTransactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.PAID) {
            return mapToPaymentResponse(payment);
        }

        // Update payment status
        payment.setStatus(PaymentStatus.PAID);
        payment.setCompletedAt(LocalDateTime.now());
        payment.setProviderTransactionId(providerTransactionId);
        paymentRepository.save(payment);

        // Update order status
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse processPaymentFailure(String transactionId, String errorCode, String errorMessage) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setErrorCode(errorCode);
        payment.setErrorMessage(errorMessage);
        paymentRepository.save(payment);

        return mapToPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse processPaymentCancellation(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setErrorMessage("Payment cancelled by user");
        paymentRepository.save(payment);

        return mapToPaymentResponse(payment);
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .providerTransactionId(payment.getProviderTransactionId())
                .errorMessage(payment.getErrorMessage())
                .initiatedAt(payment.getInitiatedAt())
                .completedAt(payment.getCompletedAt())
                .build();
    }
}
