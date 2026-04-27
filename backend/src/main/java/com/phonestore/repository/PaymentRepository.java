package com.phonestore.repository;

import com.phonestore.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByProviderTransactionId(String providerTransactionId);

    @Modifying
    @Query("UPDATE Payment p SET p.status = :status, p.completedAt = :completedAt WHERE p.id = :paymentId")
    int updateStatus(@Param("paymentId") Long paymentId, @Param("status") com.phonestore.enums.PaymentStatus status, @Param("completedAt") LocalDateTime completedAt);
}
