package com.phonestore.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phonestore.dto.request.AddToCartRequest;
import com.phonestore.dto.request.UpdateCartItemRequest;
import com.phonestore.dto.response.CartResponse;
import com.phonestore.entity.Product;
import com.phonestore.entity.ProductVariant;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    private static final String CART_KEY_PREFIX = "cart:";
    private static final Duration CART_TTL = Duration.ofDays(30);
    private static final Duration GUEST_CART_TTL = Duration.ofDays(7);

    public CartResponse getCart(Long userId, String sessionId) {
        String cartKey = buildCartKey(userId, sessionId);
        CartData cart = getCartFromRedis(cartKey);

        if (cart == null) {
            cart = createEmptyCart(userId, sessionId);
        }

        return buildCartResponse(cart, cartKey);
    }

    public CartResponse addToCart(Long userId, String sessionId, AddToCartRequest request) {
        String cartKey = buildCartKey(userId, sessionId);
        CartData cart = getCartFromRedis(cartKey);

        if (cart == null) {
            cart = createEmptyCart(userId, sessionId);
        }

        // Validate product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!Boolean.TRUE.equals(product.getIsActive()) || product.getDeletedAt() != null) {
            throw new RuntimeException("Product is not available");
        }

        // Validate variant if provided
        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found"));
            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new RuntimeException("Variant is not available");
            }
        }

        // Check stock
        int availableStock = variant != null ? variant.getStockQuantity() : product.getTotalStock();
        if (availableStock < request.getQuantity()) {
            throw new RuntimeException("Not enough stock available");
        }

        // Generate item ID
        String itemId = generateItemId(request.getProductId(), request.getVariantId());

        // Check if item already exists
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > availableStock) {
                throw new RuntimeException("Not enough stock available");
            }
            existingItem.setQuantity(newQuantity);
            existingItem.setTotalPrice(calculateItemTotal(existingItem));
        } else {
            CartItem newItem = CartItem.builder()
                    .itemId(itemId)
                    .productId(product.getId())
                    .variantId(variant != null ? variant.getId() : null)
                    .productName(product.getName())
                    .productSlug(product.getSlug())
                    .productImage(getProductImage(product))
                    .variantName(variant != null ? variant.getVariantName() : null)
                    .quantity(request.getQuantity())
                    .maxQuantity(availableStock)
                    .unitPrice(getUnitPrice(product, variant))
                    .totalPrice(getUnitPrice(product, variant).multiply(BigDecimal.valueOf(request.getQuantity())))
                    .available(true)
                    .build();
            cart.getItems().add(newItem);
        }

        calculateCartTotals(cart);
        saveCartToRedis(cartKey, cart, userId != null);

        return buildCartResponse(cart, cartKey);
    }

    public CartResponse updateCartItem(Long userId, String sessionId, String itemId, UpdateCartItemRequest request) {
        String cartKey = buildCartKey(userId, sessionId);
        CartData cart = getCartFromRedis(cartKey);

        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(item);
        } else {
            // Check stock
            ProductVariant variant = item.getVariantId() != null ?
                    variantRepository.findById(item.getVariantId()).orElse(null) : null;
            int availableStock = variant != null ? variant.getStockQuantity() :
                    productRepository.findById(item.getProductId())
                            .map(Product::getTotalStock).orElse(0);

            if (request.getQuantity() > availableStock) {
                throw new RuntimeException("Not enough stock available");
            }

            item.setQuantity(request.getQuantity());
            item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
            item.setMaxQuantity(availableStock);
        }

        calculateCartTotals(cart);
        saveCartToRedis(cartKey, cart, userId != null);

        return buildCartResponse(cart, cartKey);
    }

    public CartResponse removeFromCart(Long userId, String sessionId, String itemId) {
        String cartKey = buildCartKey(userId, sessionId);
        CartData cart = getCartFromRedis(cartKey);

        if (cart == null) {
            throw new RuntimeException("Cart not found");
        }

        cart.getItems().removeIf(item -> item.getItemId().equals(itemId));

        calculateCartTotals(cart);
        saveCartToRedis(cartKey, cart, userId != null);

        return buildCartResponse(cart, cartKey);
    }

    public void clearCart(Long userId, String sessionId) {
        String cartKey = buildCartKey(userId, sessionId);
        redisTemplate.delete(cartKey);
    }

    public void mergeGuestCartToUserCart(String sessionId, Long userId) {
        String guestKey = buildCartKey(null, sessionId);
        String userKey = buildCartKey(userId, null);

        CartData guestCart = getCartFromRedis(guestKey);
        if (guestCart == null || guestCart.getItems().isEmpty()) {
            return;
        }

        CartData userCart = getCartFromRedis(userKey);
        if (userCart == null) {
            userCart = createEmptyCart(userId, null);
        }

        // Merge items
        for (CartItem guestItem : guestCart.getItems()) {
            CartItem existingItem = userCart.getItems().stream()
                    .filter(item -> item.getItemId().equals(guestItem.getItemId()))
                    .findFirst()
                    .orElse(null);

            if (existingItem != null) {
                existingItem.setQuantity(existingItem.getQuantity() + guestItem.getQuantity());
                existingItem.setTotalPrice(existingItem.getUnitPrice()
                        .multiply(BigDecimal.valueOf(existingItem.getQuantity())));
            } else {
                userCart.getItems().add(guestItem);
            }
        }

        calculateCartTotals(userCart);
        saveCartToRedis(userKey, userCart, true);
        redisTemplate.delete(guestKey);
    }

    private String buildCartKey(Long userId, String sessionId) {
        if (userId != null) {
            return CART_KEY_PREFIX + "user:" + userId;
        }
        return CART_KEY_PREFIX + "session:" + sessionId;
    }

    private CartData getCartFromRedis(String key) {
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            return null;
        }
        try {
            return objectMapper.readValue(json, CartData.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse cart from Redis", e);
            return null;
        }
    }

    private void saveCartToRedis(String key, CartData cart, boolean isUserCart) {
        try {
            String json = objectMapper.writeValueAsString(cart);
            redisTemplate.opsForValue().set(key, json, isUserCart ? CART_TTL : GUEST_CART_TTL);
        } catch (JsonProcessingException e) {
            log.error("Failed to save cart to Redis", e);
            throw new RuntimeException("Failed to save cart");
        }
    }

    private CartData createEmptyCart(Long userId, String sessionId) {
        return CartData.builder()
                .cartId(userId != null ? "user-" + userId : "session-" + sessionId)
                .userId(userId)
                .sessionId(sessionId)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .build();
    }

    private void calculateCartTotals(CartData cart) {
        int totalItems = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalItems(totalItems);
        cart.setSubtotal(subtotal);
    }

    private CartResponse buildCartResponse(CartData cart, String cartKey) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartResponse.CartItemResponse.builder()
                        .itemId(item.getItemId())
                        .productId(item.getProductId())
                        .variantId(item.getVariantId())
                        .productName(item.getProductName())
                        .productSlug(item.getProductSlug())
                        .productImage(item.getProductImage())
                        .variantName(item.getVariantName())
                        .quantity(item.getQuantity())
                        .maxQuantity(item.getMaxQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .available(item.isAvailable())
                        .build())
                .toList();

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .totalItems(cart.getTotalItems())
                .subtotal(cart.getSubtotal())
                .discountAmount(cart.getDiscountAmount())
                .couponCode(cart.getCouponCode())
                .finalTotal(cart.getSubtotal().subtract(cart.getDiscountAmount()))
                .items(itemResponses)
                .build();
    }

    private BigDecimal calculateItemTotal(CartItem item) {
        return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    private String generateItemId(Long productId, Long variantId) {
        return productId + "-" + (variantId != null ? variantId : "default");
    }

    private BigDecimal getUnitPrice(Product product, ProductVariant variant) {
        if (variant != null && variant.getPriceAdjustment() != null) {
            return product.getFinalPrice().add(variant.getPriceAdjustment());
        }
        return product.getFinalPrice();
    }

    private String getProductImage(Product product) {
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            return product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .orElse(product.getImages().get(0))
                    .getImageUrl();
        }
        return null;
    }
}
