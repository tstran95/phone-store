package com.phonestore.controller;

import com.phonestore.dto.request.InventoryAdjustmentRequest;
import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.InventoryTransactionResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.StockAlertResponse;
import com.phonestore.entity.User;
import com.phonestore.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PagedResponse<InventoryTransactionResponse>>> getTransactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PagedResponse<InventoryTransactionResponse> response = inventoryService.getTransactions(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<StockAlertResponse>>> getActiveAlerts() {
        List<StockAlertResponse> alerts = inventoryService.getActiveStockAlertResponses();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PutMapping("/alerts/{alertId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveAlert(
            @PathVariable Long alertId,
            @AuthenticationPrincipal User user) {

        inventoryService.resolveStockAlert(alertId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Alert resolved", null));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<Void>> adjustStock(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody InventoryAdjustmentRequest request) {

        inventoryService.recordAdjustment(
                request.getProductId(),
                request.getVariantId(),
                request.getNewQuantity(),
                request.getReason(),
                user.getId()
        );
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted", null));
    }

    @GetMapping("/stock/{productId}")
    public ResponseEntity<ApiResponse<Integer>> getCurrentStock(
            @PathVariable Long productId,
            @RequestParam(required = false) Long variantId) {

        Integer stock = inventoryService.getCurrentStock(productId, variantId);
        return ResponseEntity.ok(ApiResponse.success(stock));
    }
}
