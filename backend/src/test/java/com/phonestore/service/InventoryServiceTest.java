package com.phonestore.service;

import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.StockAlertResponse;
import com.phonestore.dto.response.InventoryTransactionResponse;
import com.phonestore.entity.InventoryTransaction;
import com.phonestore.entity.Product;
import com.phonestore.entity.ProductVariant;
import com.phonestore.entity.StockAlert;
import com.phonestore.enums.TransactionType;
import com.phonestore.repository.InventoryTransactionRepository;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ProductVariantRepository;
import com.phonestore.repository.StockAlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @Mock
    private StockAlertRepository stockAlertRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private InventoryService inventoryService;

    private Product testProduct;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
                .id(1L)
                .name("iPhone 15")
                .variants(new ArrayList<>())
                .build();

        testVariant = ProductVariant.builder()
                .id(1L)
                .product(testProduct)
                .variantName("128GB Black")
                .stockQuantity(10)
                .lowStockThreshold(5)
                .build();
    }

    @Test
    @DisplayName("Should record sale transaction")
    void recordSale_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));
        when(transactionRepository.save(any(InventoryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.recordSale(1L, 1L, 2, 100L, 1L);

        verify(transactionRepository).save(any(InventoryTransaction.class));
        verify(stockAlertRepository, never()).save(any(StockAlert.class));
    }

    @Test
    @DisplayName("Should create stock alert when stock is low")
    void recordSale_LowStock() {
        testVariant.setStockQuantity(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));
        when(transactionRepository.save(any(InventoryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(stockAlertRepository.existsByProductIdAndVariantIdAndIsResolvedFalse(1L, 1L))
                .thenReturn(false);
        when(stockAlertRepository.save(any(StockAlert.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.recordSale(1L, 1L, 2, 100L, 1L);

        verify(stockAlertRepository).save(any(StockAlert.class));
        verify(emailService).sendLowStockAlert(anyString(), anyString(), anyInt());
    }

    @Test
    @DisplayName("Should record purchase transaction")
    void recordPurchase_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));
        when(transactionRepository.save(any(InventoryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.recordPurchase(1L, 1L, 5, 200L, 1L);

        verify(transactionRepository).save(any(InventoryTransaction.class));
        verify(variantRepository).save(any(ProductVariant.class));
        assertEquals(15, testVariant.getStockQuantity());
    }

    @Test
    @DisplayName("Should record adjustment transaction")
    void recordAdjustment_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));
        when(transactionRepository.save(any(InventoryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(variantRepository.save(any(ProductVariant.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.recordAdjustment(1L, 1L, 20, "Stock count adjustment", 1L);

        verify(transactionRepository).save(any(InventoryTransaction.class));
        verify(variantRepository).save(any(ProductVariant.class));
        assertEquals(20, testVariant.getStockQuantity());
    }

    @Test
    @DisplayName("Should get active stock alerts")
    void getActiveStockAlerts_Success() {
        StockAlert alert = StockAlert.builder()
                .id(1L)
                .product(testProduct)
                .variant(testVariant)
                .alertType(StockAlert.AlertType.LOW_STOCK)
                .currentStock(3)
                .isResolved(false)
                .build();

        when(stockAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc())
                .thenReturn(List.of(alert));

        List<StockAlertResponse> response = inventoryService.getActiveStockAlertResponses();

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(StockAlert.AlertType.LOW_STOCK, response.get(0).getAlertType());
    }

    @Test
    @DisplayName("Should resolve stock alert")
    void resolveStockAlert_Success() {
        StockAlert alert = StockAlert.builder()
                .id(1L)
                .isResolved(false)
                .build();

        when(stockAlertRepository.findById(1L)).thenReturn(Optional.of(alert));
        when(stockAlertRepository.save(any(StockAlert.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.resolveStockAlert(1L, 1L);

        assertTrue(alert.getIsResolved());
        verify(stockAlertRepository).save(alert);
    }

    @Test
    @DisplayName("Should get current stock for variant")
    void getCurrentStock_WithVariant() {
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));

        Integer stock = inventoryService.getCurrentStock(1L, 1L);

        assertEquals(10, stock);
    }

    @Test
    @DisplayName("Should get current stock for product")
    void getCurrentStock_WithoutVariant() {
        testProduct.getVariants().add(testVariant);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        Integer stock = inventoryService.getCurrentStock(1L, null);

        assertEquals(10, stock);
    }

    @Test
    @DisplayName("Should get inventory transactions")
    void getTransactions_Success() {
        InventoryTransaction transaction = InventoryTransaction.builder()
                .id(1L)
                .product(testProduct)
                .variant(testVariant)
                .transactionType(TransactionType.SALE)
                .quantity(-2)
                .previousStock(10)
                .newStock(8)
                .build();

        Page<InventoryTransaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findAll(any(Pageable.class))).thenReturn(page);

        PagedResponse<InventoryTransactionResponse> response = inventoryService.getTransactions(null, Pageable.unpaged());

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(TransactionType.SALE, response.getContent().get(0).getTransactionType());
    }
}
