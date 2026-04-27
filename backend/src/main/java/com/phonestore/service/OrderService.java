package com.phonestore.service;

import com.phonestore.dto.request.CheckoutRequest;
import com.phonestore.dto.response.CartResponse;
import com.phonestore.dto.response.OrderResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.entity.Order;
import com.phonestore.entity.OrderItem;
import com.phonestore.entity.OrderStatusHistory;
import com.phonestore.entity.Product;
import com.phonestore.entity.ProductVariant;
import com.phonestore.entity.User;
import com.phonestore.enums.OrderStatus;
import com.phonestore.enums.PaymentStatus;
import com.phonestore.repository.OrderItemRepository;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.OrderStatusHistoryRepository;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CartService cartService;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponse createOrder(Long userId, CheckoutRequest request) {
        // Get cart
        CartResponse cart = cartService.getCart(userId, null);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Validate stock for all items
        for (CartResponse.CartItemResponse item : cart.getItems()) {
            validateStock(item);
        }

        // Generate order number
        String orderNumber = generateOrderNumber();

        // Calculate amounts
        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal shippingFee = calculateShippingFee(subtotal);
        BigDecimal taxAmount = subtotal.multiply(BigDecimal.valueOf(0.1)); // 10% tax
        BigDecimal discountAmount = cart.getDiscountAmount();
        BigDecimal totalAmount = subtotal.add(shippingFee).add(taxAmount).subtract(discountAmount);

        // Create order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(userId != null ? User.builder().id(userId).build() : null)
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .shippingProvince(request.getShippingProvince())
                .shippingDistrict(request.getShippingDistrict())
                .shippingWard(request.getShippingWard())
                .subtotal(subtotal)
                .shippingFee(shippingFee)
                .taxAmount(taxAmount)
                .discountAmount(discountAmount)
                .couponCode(request.getCouponCode())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .shippingMethod(request.getShippingMethod())
                .customerNote(request.getCustomerNote())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartResponse.CartItemResponse item : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(Product.builder().id(item.getProductId()).build())
                    .variant(item.getVariantId() != null ? ProductVariant.builder().id(item.getVariantId()).build() : null)
                    .productName(item.getProductName())
                    .productSku(getProductSku(item))
                    .productImage(item.getProductImage())
                    .quantity(item.getQuantity())
                    .unitPrice(item.getUnitPrice())
                    .totalPrice(item.getTotalPrice())
                    .build();
            orderItems.add(orderItem);

            // Decrease stock
            decreaseStock(item);
        }
        orderItemRepository.saveAll(orderItems);

        // Add status history
        addStatusHistory(savedOrder, null, OrderStatus.PENDING, userId, "Order created");

        // Clear cart after successful order
        cartService.clearCart(userId, null);

        // Create payment
        paymentService.createPayment(savedOrder);

        return mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<OrderResponse> content = orderPage.getContent()
                .stream()
                .map(this::mapToOrderResponse)
                .toList();

        return PagedResponse.<OrderResponse>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Transactional
    public OrderResponse cancelOrder(String orderNumber, Long userId, String reason) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!canCancel(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled");
        }

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(reason);
        orderRepository.save(order);

        addStatusHistory(order, oldStatus, OrderStatus.CANCELLED, userId, reason);

        // Restore stock
        restoreStock(order);

        return mapToOrderResponse(order);
    }

    private void validateStock(CartResponse.CartItemResponse item) {
        if (item.getVariantId() != null) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + item.getProductName());
            }
        } else {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            if (product.getTotalStock() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + item.getProductName());
            }
        }
    }

    private void decreaseStock(CartResponse.CartItemResponse item) {
        if (item.getVariantId() != null) {
            variantRepository.decreaseStock(item.getVariantId(), item.getQuantity());
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                variantRepository.increaseStock(item.getVariant().getId(), item.getQuantity());
            }
        }
    }

    private void addStatusHistory(Order order, OrderStatus fromStatus, OrderStatus toStatus, Long userId, String note) {
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .statusFrom(fromStatus)
                .statusTo(toStatus)
                .changedBy(userId != null ? User.builder().id(userId).build() : null)
                .note(note)
                .build();
        statusHistoryRepository.save(history);
    }

    private boolean canCancel(OrderStatus status) {
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }

    private String generateOrderNumber() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + dateStr + "-" + uuid;
    }

    private BigDecimal calculateShippingFee(BigDecimal subtotal) {
        if (subtotal.compareTo(BigDecimal.valueOf(500000)) >= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(30000);
    }

    private String getProductSku(CartResponse.CartItemResponse item) {
        if (item.getVariantId() != null) {
            return variantRepository.findById(item.getVariantId())
                    .map(ProductVariant::getSku)
                    .orElse("");
        }
        return productRepository.findById(item.getProductId())
                .map(Product::getSku)
                .orElse("");
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .taxAmount(order.getTaxAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(formatAddress(order))
                .trackingNumber(order.getTrackingNumber())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .items(order.getItems() != null ?
                        order.getItems().stream()
                                .map(item -> OrderResponse.OrderItemResponse.builder()
                                        .id(item.getId())
                                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                                        .productName(item.getProductName())
                                        .productSku(item.getProductSku())
                                        .productImage(item.getProductImage())
                                        .quantity(item.getQuantity())
                                        .unitPrice(item.getUnitPrice())
                                        .totalPrice(item.getTotalPrice())
                                        .build())
                                .toList() : List.of())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .build();
    }

    private String formatAddress(Order order) {
        return String.format("%s, %s, %s, %s",
                order.getShippingAddress(),
                order.getShippingWard(),
                order.getShippingDistrict(),
                order.getShippingProvince());
    }
}
