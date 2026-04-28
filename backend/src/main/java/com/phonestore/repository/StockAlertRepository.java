package com.phonestore.repository;

import com.phonestore.entity.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {

    List<StockAlert> findByIsResolvedFalseOrderByCreatedAtDesc();

    List<StockAlert> findByProductIdAndVariantIdAndIsResolvedFalse(Long productId, Long variantId);

    boolean existsByProductIdAndVariantIdAndIsResolvedFalse(Long productId, Long variantId);
}
