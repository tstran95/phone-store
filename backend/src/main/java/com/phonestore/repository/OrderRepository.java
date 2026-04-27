package com.phonestore.repository;

import com.phonestore.entity.Order;
import com.phonestore.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    @Modifying
    @Query("UPDATE Order o SET o.status = :status, o.updatedAt = :now WHERE o.id = :orderId")
    int updateStatus(@Param("orderId") Long orderId, @Param("status") OrderStatus status, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Order o SET o.paymentStatus = :status, o.paidAt = :paidAt WHERE o.id = :orderId")
    int updatePaymentStatus(@Param("orderId") Long orderId, @Param("status") com.phonestore.enums.PaymentStatus status, @Param("paidAt") LocalDateTime paidAt);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);
}
