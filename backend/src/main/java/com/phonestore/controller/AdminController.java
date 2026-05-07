package com.phonestore.controller;

import com.phonestore.dto.request.BannerRequest;
import com.phonestore.dto.request.CategoryRequest;
import com.phonestore.dto.response.*;
import com.phonestore.entity.Banner;
import com.phonestore.entity.Category;
import com.phonestore.enums.OrderStatus;
import com.phonestore.repository.BannerRepository;
import com.phonestore.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;
    private final BannerRepository bannerRepository;

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

    // ==================== CATEGORY MANAGEMENT ====================

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> response = categories.stream()
                .map(this::mapToCategoryResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return ResponseEntity.ok(ApiResponse.success(mapToCategoryResponse(category)));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @RequestBody CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Category created", mapToCategoryResponse(saved)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Category updated", mapToCategoryResponse(saved)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .build();
    }

    // ==================== BANNER MANAGEMENT ====================

    @GetMapping("/banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAllBanners() {
        List<Banner> banners = bannerRepository.findAll();
        List<BannerResponse> response = banners.stream()
                .map(this::mapToBannerResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        return ResponseEntity.ok(ApiResponse.success(mapToBannerResponse(banner)));
    }

    @PostMapping("/banners")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(
            @RequestBody BannerRequest request) {
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .buttonText(request.getButtonText())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .position(request.getPosition() != null ? request.getPosition() : "HOME_MAIN")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(ApiResponse.success("Banner created", mapToBannerResponse(saved)));
    }

    @PutMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @RequestBody BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        banner.setTitle(request.getTitle());
        banner.setDescription(request.getDescription());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setButtonText(request.getButtonText());
        if (request.getDisplayOrder() != null) {
            banner.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            banner.setIsActive(request.getIsActive());
        }
        if (request.getPosition() != null) {
            banner.setPosition(request.getPosition());
        }
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());

        Banner saved = bannerRepository.save(banner);
        return ResponseEntity.ok(ApiResponse.success("Banner updated", mapToBannerResponse(saved)));
    }

    @DeleteMapping("/banners/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        bannerRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted", null));
    }

    @PostMapping("/banners/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderBanners(@RequestBody List<Map<String, Object>> orders) {
        for (Map<String, Object> order : orders) {
            Long id = Long.valueOf(order.get("id").toString());
            Integer displayOrder = Integer.valueOf(order.get("displayOrder").toString());
            bannerRepository.findById(id).ifPresent(banner -> {
                banner.setDisplayOrder(displayOrder);
                bannerRepository.save(banner);
            });
        }
        return ResponseEntity.ok(ApiResponse.success("Banners reordered", null));
    }

    private BannerResponse mapToBannerResponse(Banner banner) {
        return BannerResponse.builder()
                .id(banner.getId())
                .title(banner.getTitle())
                .description(banner.getDescription())
                .imageUrl(banner.getImageUrl())
                .linkUrl(banner.getLinkUrl())
                .buttonText(banner.getButtonText())
                .displayOrder(banner.getDisplayOrder())
                .isActive(banner.getIsActive())
                .position(banner.getPosition())
                .startDate(banner.getStartDate())
                .endDate(banner.getEndDate())
                .build();
    }
}
