package com.phonestore.repository;

import com.phonestore.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    List<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    Page<InventoryTransaction> findByProductId(Long productId, Pageable pageable);

    List<InventoryTransaction> findByReferenceTypeAndReferenceId(
            InventoryTransaction.ReferenceType referenceType, Long referenceId);
}
