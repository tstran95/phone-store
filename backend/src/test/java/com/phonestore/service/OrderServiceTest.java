package com.phonestore.service;

import com.phonestore.dto.request.CheckoutRequest;
import com.phonestore.dto.response.OrderResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.entity.Order;
import com.phonestore.entity.OrderItem;
import com.phonestore.entity.Product;
import com.phonestore.entity.User;
import com.phonestore.enums.OrderStatus;
import com.phonestore.enums.PaymentMethod;
import com.phonestore.enums.PaymentStatus;
import com.phonestore.repository.OrderItemRepository;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.OrderStatusHistoryRepository;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderStatusHistoryRepository statusHistoryRepository;

    @Mock
    private CartService cartService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Order testOrder;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testOrder = Order.builder()
                .id(1L)
                .orderNumber("ORD-20240101-ABC123")
                .user(testUser)
                .subtotal(BigDecimal.valueOf(20000000))
                .shippingFee(BigDecimal.valueOf(30000))
                .taxAmount(BigDecimal.valueOf(2000000))
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(22030000))
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.COD)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingName("Test User")
                .shippingPhone("0912345678")
                .shippingAddress("123 Main St")
                .shippingProvince("HCM")
                .shippingDistrict("District 1")
                .shippingWard("Ward 1")
                .items(new ArrayList<>())
                .build();

        checkoutRequest = CheckoutRequest.builder()
                .paymentMethod(PaymentMethod.COD)
                .shippingName("Test User")
                .shippingPhone("0912345678")
                .shippingAddress("123 Main St")
                .shippingProvince("HCM")
                .shippingDistrict("District 1")
                .shippingWard("Ward 1")
                .build();
    }

    @Test
    @DisplayName("Should get order by number successfully")
    void getOrderByNumber_Success() {
        when(orderRepository.findByOrderNumber(testOrder.getOrderNumber()))
                .thenReturn(Optional.of(testOrder));

        OrderResponse response = orderService.getOrderByNumber(testOrder.getOrderNumber());

        assertNotNull(response);
        assertEquals(testOrder.getOrderNumber(), response.getOrderNumber());
        assertEquals(testOrder.getTotalAmount(), response.getTotalAmount());
    }

    @Test
    @DisplayName("Should throw exception when order not found")
    void getOrderByNumber_NotFound() {
        when(orderRepository.findByOrderNumber("NON-EXISTENT"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> orderService.getOrderByNumber("NON-EXISTENT"));

        assertEquals("Order not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should get user orders with pagination")
    void getUserOrders_Success() {
        List<Order> orders = List.of(testOrder);
        Page<Order> orderPage = new PageImpl<>(orders);

        when(orderRepository.findByUserIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class)))
                .thenReturn(orderPage);

        PagedResponse<OrderResponse> response = orderService.getUserOrders(1L, 0, 10);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(testOrder.getOrderNumber(), response.getContent().get(0).getOrderNumber());
    }

    @Test
    @DisplayName("Should check if order can be cancelled")
    void canCancel_PendingOrder() {
        testOrder.setStatus(OrderStatus.PENDING);
        assertTrue(testOrder.canCancel());
    }

    @Test
    @DisplayName("Should check if delivered order cannot be cancelled")
    void canCancel_DeliveredOrder() {
        testOrder.setStatus(OrderStatus.DELIVERED);
        assertFalse(testOrder.canCancel());
    }

    @Test
    @DisplayName("Should check if order can be refunded")
    void canRefund_DeliveredPaidOrder() {
        testOrder.setStatus(OrderStatus.DELIVERED);
        testOrder.setPaymentStatus(PaymentStatus.PAID);
        assertTrue(testOrder.canRefund());
    }
}
