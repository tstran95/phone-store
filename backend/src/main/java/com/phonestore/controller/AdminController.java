package com.phonestore.controller;

import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.OrderResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.ProductResponse;
import com.phonestore.dto.response.UserResponse;
import com.phonestore.entity.Order;
import com.phonestore.entity.Product;
import com.phonestore.entity.User;
import com.phonestore.enums.OrderStatus;
import com.phonestore.service.OrderService;
import com.phonestore.service.ProductService;
import com.phonestore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminController {

    private final ProductService productService;
    private final UserService userService;
    private final OrderService orderService;

    // ==================== PRODUCT MANAGEMENT ====================

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductResponse> products = productService.getAllProductsForAdmin(search, active, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.fromPage(products)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created", product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated", product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PatchMapping("/products/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        ProductResponse product = productService.toggleProductStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Product status updated", product));
    }

    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> users = userService.getAllUsersForAdmin(search, role, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.fromPage(users)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        UserResponse user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        UserResponse user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated", user));
    }

    // ==================== ORDER MANAGEMENT ====================

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orders = orderService.getAllOrdersForAdmin(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.fromPage(orders)));
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber) {
        OrderResponse order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PatchMapping("/orders/{orderNumber}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam String status,
            @RequestParam(required = false) String note) {
        OrderResponse order = orderService.updateOrderStatus(orderNumber, status, note);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    // ==================== DASHBOARD STATS ====================

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = Map.of(
                "totalUsers", userService.countUsers(),
                "totalProducts", productService.countProducts(),
                "totalOrders", orderService.countOrders(),
                "totalRevenue", orderService.getTotalRevenue(),
                "pendingOrders", orderService.countOrdersByStatus(OrderStatus.PENDING),
                "newUsersToday", userService.countNewUsersToday(),
                "ordersToday", orderService.countOrdersToday(),
                "revenueToday", orderService.getRevenueToday()
        );
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/dashboard/recent-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit) {
        List<OrderResponse> orders = orderService.getRecentOrders(limit);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/dashboard/top-products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        List<Map<String, Object>> products = productService.getTopSellingProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
}
