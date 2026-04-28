package com.phonestore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phonestore.dto.request.AddToCartRequest;
import com.phonestore.dto.request.UpdateCartItemRequest;
import com.phonestore.dto.response.CartResponse;
import com.phonestore.entity.Product;
import com.phonestore.entity.ProductVariant;
import com.phonestore.enums.ProductStatus;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private CartService cartService;

    private Product testProduct;
    private ProductVariant testVariant;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        testProduct = Product.builder()
                .id(1L)
                .sku("IP15-128")
                .name("iPhone 15 128GB")
                .slug("iphone-15-128gb")
                .basePrice(BigDecimal.valueOf(22000000))
                .salePrice(BigDecimal.valueOf(20000000))
                .status(ProductStatus.ACTIVE)
                .isActive(true)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        testVariant = ProductVariant.builder()
                .id(1L)
                .sku("IP15-128-BLK")
                .variantName("Black")
                .stockQuantity(10)
                .isActive(true)
                .product(testProduct)
                .build();
    }

    @Test
    @DisplayName("Should add item to cart successfully")
    void addToCart_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));
        when(valueOperations.get(anyString())).thenReturn(null);

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .variantId(1L)
                .quantity(2)
                .build();

        CartResponse response = cartService.addToCart(1L, null, request);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getTotalItems());
        verify(valueOperations).set(anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Should throw exception when product not found")
    void addToCart_ProductNotFound() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .quantity(1)
                .build();

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.addToCart(1L, null, request));

        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when not enough stock")
    void addToCart_NotEnoughStock() {
        testVariant.setStockQuantity(1);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(1L)
                .variantId(1L)
                .quantity(5)
                .build();

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> cartService.addToCart(1L, null, request));

        assertEquals("Not enough stock available", exception.getMessage());
    }

    @Test
    @DisplayName("Should update cart item quantity")
    void updateCartItem_Success() {
        String cartJson = "{\"cartId\":\"user-1\",\"items\":[{\"itemId\":\"1-1\",\"productId\":1,\"variantId\":1,\"quantity\":2,\"unitPrice\":20000000,\"totalPrice\":40000000,\"maxQuantity\":10,\"productName\":\"iPhone 15\",\"productSlug\":\"iphone-15\",\"available\":true}],\"totalItems\":2,\"subtotal\":40000000,\"discountAmount\":0}";

        when(valueOperations.get(anyString())).thenReturn(cartJson);
        when(variantRepository.findById(1L)).thenReturn(Optional.of(testVariant));

        UpdateCartItemRequest request = UpdateCartItemRequest.builder()
                .quantity(3)
                .build();

        CartResponse response = cartService.updateCartItem(1L, null, "1-1", request);

        assertNotNull(response);
        verify(valueOperations).set(anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Should remove item from cart")
    void removeFromCart_Success() {
        String cartJson = "{\"cartId\":\"user-1\",\"items\":[{\"itemId\":\"1-1\",\"productId\":1,\"variantId\":1,\"quantity\":2,\"unitPrice\":20000000,\"totalPrice\":40000000}],\"totalItems\":2,\"subtotal\":40000000}";

        when(valueOperations.get(anyString())).thenReturn(cartJson);

        CartResponse response = cartService.removeFromCart(1L, null, "1-1");

        assertNotNull(response);
        assertEquals(0, response.getItems().size());
    }

    @Test
    @DisplayName("Should clear cart")
    void clearCart_Success() {
        cartService.clearCart(1L, null);

        verify(redisTemplate).delete(anyString());
    }
}
