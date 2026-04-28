package com.phonestore.service;

import com.phonestore.dto.response.InventoryTransactionResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.StockAlertResponse;
import com.phonestore.entity.InventoryTransaction;
import com.phonestore.entity.Product;
import com.phonestore.entity.ProductVariant;
import com.phonestore.entity.StockAlert;
import com.phonestore.entity.User;
import com.phonestore.enums.TransactionType;
import com.phonestore.repository.InventoryTransactionRepository;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ProductVariantRepository;
import com.phonestore.repository.StockAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final StockAlertRepository stockAlertRepository;
    private final EmailService emailService;

    @Transactional
    public void recordSale(Long productId, Long variantId, Integer quantity, Long orderId, Long userId) {
        ProductVariant variant = variantId != null ?
                variantRepository.findById(variantId).orElse(null) : null;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer previousStock = variant != null ? variant.getStockQuantity() : product.getTotalStock();
        Integer newStock = previousStock - quantity;

        // Record transaction
        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .variant(variant)
                .transactionType(TransactionType.SALE)
                .quantity(-quantity)
                .previousStock(previousStock)
                .newStock(newStock)
                .referenceType(InventoryTransaction.ReferenceType.ORDER)
                .referenceId(orderId)
                .performedBy(userId != null ? User.builder().id(userId).build() : null)
                .build();

        transactionRepository.save(transaction);

        // Check for low stock
        if (variant != null && newStock <= variant.getLowStockThreshold()) {
            createStockAlert(product, variant, newStock);
        }

        log.info("Recorded sale for product: {}, quantity: {}", productId, quantity);
    }

    @Transactional
    public void recordPurchase(Long productId, Long variantId, Integer quantity, Long purchaseOrderId, Long userId) {
        ProductVariant variant = variantId != null ?
                variantRepository.findById(variantId).orElse(null) : null;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer previousStock = variant != null ? variant.getStockQuantity() : product.getTotalStock();
        Integer newStock = previousStock + quantity;

        // Record transaction
        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .variant(variant)
                .transactionType(TransactionType.PURCHASE)
                .quantity(quantity)
                .previousStock(previousStock)
                .newStock(newStock)
                .referenceType(InventoryTransaction.ReferenceType.PURCHASE_ORDER)
                .referenceId(purchaseOrderId)
                .performedBy(userId != null ? User.builder().id(userId).build() : null)
                .build();

        transactionRepository.save(transaction);

        // Update stock
        if (variant != null) {
            variant.setStockQuantity(newStock);
            variantRepository.save(variant);
        }

        // Resolve any open alerts
        markStockAlertResolved(productId, variantId);

        log.info("Recorded purchase for product: {}, quantity: {}", productId, quantity);
    }

    @Transactional
    public void recordAdjustment(Long productId, Long variantId, Integer newQuantity, String reason, Long userId) {
        ProductVariant variant = variantId != null ?
                variantRepository.findById(variantId).orElse(null) : null;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer previousStock = variant != null ? variant.getStockQuantity() : product.getTotalStock();

        // Record transaction
        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .variant(variant)
                .transactionType(TransactionType.ADJUSTMENT)
                .quantity(newQuantity - previousStock)
                .previousStock(previousStock)
                .newStock(newQuantity)
                .referenceType(InventoryTransaction.ReferenceType.MANUAL)
                .notes(reason)
                .performedBy(userId != null ? User.builder().id(userId).build() : null)
                .build();

        transactionRepository.save(transaction);

        // Update stock
        if (variant != null) {
            variant.setStockQuantity(newQuantity);
            variantRepository.save(variant);
        }

        log.info("Recorded adjustment for product: {}, new quantity: {}", productId, newQuantity);
    }

    @Transactional
    public void recordReturn(Long productId, Long variantId, Integer quantity, Long orderId, Long userId) {
        ProductVariant variant = variantId != null ?
                variantRepository.findById(variantId).orElse(null) : null;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Integer previousStock = variant != null ? variant.getStockQuantity() : product.getTotalStock();
        Integer newStock = previousStock + quantity;

        // Record transaction
        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .variant(variant)
                .transactionType(TransactionType.RETURN)
                .quantity(quantity)
                .previousStock(previousStock)
                .newStock(newStock)
                .referenceType(InventoryTransaction.ReferenceType.ORDER)
                .referenceId(orderId)
                .performedBy(userId != null ? User.builder().id(userId).build() : null)
                .build();

        transactionRepository.save(transaction);

        // Update stock
        if (variant != null) {
            variant.setStockQuantity(newStock);
            variantRepository.save(variant);
        }

        log.info("Recorded return for product: {}, quantity: {}", productId, quantity);
    }

    @Transactional(readOnly = true)
    public List<StockAlert> getActiveStockAlerts() {
        return stockAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc();
    }

    @Transactional
    public void resolveStockAlert(Long alertId, Long userId) {
        StockAlert alert = stockAlertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Stock alert not found"));

        alert.setIsResolved(true);
        alert.setResolvedBy(User.builder().id(userId).build());
        stockAlertRepository.save(alert);

        log.info("Resolved stock alert: {}", alertId);
    }

    private void createStockAlert(Product product, ProductVariant variant, Integer currentStock) {
        // Check if alert already exists
        boolean exists = stockAlertRepository.existsByProductIdAndVariantIdAndIsResolvedFalse(
                product.getId(), variant != null ? variant.getId() : null);

        if (!exists) {
            StockAlert.AlertType alertType = currentStock <= 0 ?
                    StockAlert.AlertType.OUT_OF_STOCK : StockAlert.AlertType.LOW_STOCK;

            StockAlert alert = StockAlert.builder()
                    .product(product)
                    .variant(variant)
                    .alertType(alertType)
                    .thresholdValue(variant != null ? variant.getLowStockThreshold() : 10)
                    .currentStock(currentStock)
                    .isResolved(false)
                    .build();

            stockAlertRepository.save(alert);

            // Send notification to admin
            String productName = product.getName() +
                    (variant != null ? " - " + variant.getVariantName() : "");
            emailService.sendLowStockAlert("admin@phonestore.com", productName, currentStock);

            log.warn("Created stock alert for product: {}, current stock: {}", productName, currentStock);
        }
    }

    private void markStockAlertResolved(Long productId, Long variantId) {
        List<StockAlert> alerts = stockAlertRepository.findByProductIdAndVariantIdAndIsResolvedFalse(
                productId, variantId);

        for (StockAlert alert : alerts) {
            alert.setIsResolved(true);
            stockAlertRepository.save(alert);
        }
    }

    @Transactional(readOnly = true)
    public PagedResponse<InventoryTransactionResponse> getTransactions(Long productId, Pageable pageable) {
        Page<InventoryTransaction> page = productId != null ?
                transactionRepository.findByProductId(productId, pageable) :
                transactionRepository.findAll(pageable);

        List<InventoryTransactionResponse> content = page.getContent()
                .stream()
                .map(this::mapToTransactionResponse)
                .toList();

        return PagedResponse.<InventoryTransactionResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<StockAlertResponse> getActiveStockAlertResponses() {
        return stockAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToStockAlertResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Integer getCurrentStock(Long productId, Long variantId) {
        if (variantId != null) {
            return variantRepository.findById(variantId)
                    .map(ProductVariant::getStockQuantity)
                    .orElse(0);
        }
        return productRepository.findById(productId)
                .map(Product::getTotalStock)
                .orElse(0);
    }

    private InventoryTransactionResponse mapToTransactionResponse(InventoryTransaction transaction) {
        return InventoryTransactionResponse.builder()
                .id(transaction.getId())
                .productId(transaction.getProduct() != null ? transaction.getProduct().getId() : null)
                .productName(transaction.getProduct() != null ? transaction.getProduct().getName() : null)
                .variantId(transaction.getVariant() != null ? transaction.getVariant().getId() : null)
                .variantName(transaction.getVariant() != null ? transaction.getVariant().getVariantName() : null)
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .previousStock(transaction.getPreviousStock())
                .newStock(transaction.getNewStock())
                .referenceType(transaction.getReferenceType() != null ? transaction.getReferenceType().name() : null)
                .referenceId(transaction.getReferenceId())
                .notes(transaction.getNotes())
                .performedBy(transaction.getPerformedBy() != null ? transaction.getPerformedBy().getFullName() : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private StockAlertResponse mapToStockAlertResponse(StockAlert alert) {
        return StockAlertResponse.builder()
                .id(alert.getId())
                .productId(alert.getProduct() != null ? alert.getProduct().getId() : null)
                .productName(alert.getProduct() != null ? alert.getProduct().getName() : null)
                .variantId(alert.getVariant() != null ? alert.getVariant().getId() : null)
                .variantName(alert.getVariant() != null ? alert.getVariant().getVariantName() : null)
                .alertType(alert.getAlertType())
                .thresholdValue(alert.getThresholdValue())
                .currentStock(alert.getCurrentStock())
                .isResolved(alert.getIsResolved())
                .resolvedAt(alert.getResolvedAt())
                .resolvedBy(alert.getResolvedBy() != null ? alert.getResolvedBy().getFullName() : null)
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
