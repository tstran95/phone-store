package com.phonestore.controller;

import com.phonestore.dto.request.AddToCartRequest;
import com.phonestore.dto.request.UpdateCartItemRequest;
import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.CartResponse;
import com.phonestore.entity.User;
import com.phonestore.service.CartService;
import com.phonestore.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        return userService.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {

        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        String sid = getSessionId(userId, sessionId, request);

        CartResponse cart = cartService.getCart(userId, sid);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestParam(required = false) String sessionId,
            @Valid @RequestBody AddToCartRequest addRequest,
            HttpServletRequest request) {

        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        String sid = getSessionId(userId, sessionId, request);

        CartResponse cart = cartService.addToCart(userId, sid, addRequest);
        return ResponseEntity.ok(ApiResponse.success("Added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @RequestParam(required = false) String sessionId,
            @PathVariable String itemId,
            @Valid @RequestBody UpdateCartItemRequest updateRequest,
            HttpServletRequest request) {

        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        String sid = getSessionId(userId, sessionId, request);

        CartResponse cart = cartService.updateCartItem(userId, sid, itemId, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @RequestParam(required = false) String sessionId,
            @PathVariable String itemId,
            HttpServletRequest request) {

        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        String sid = getSessionId(userId, sessionId, request);

        CartResponse cart = cartService.removeFromCart(userId, sid, itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestParam(required = false) String sessionId,
            HttpServletRequest request) {

        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        String sid = getSessionId(userId, sessionId, request);

        cartService.clearCart(userId, sid);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }

    private String getSessionId(Long userId, String sessionId, HttpServletRequest request) {
        if (userId != null) {
            return null;
        }
        if (sessionId != null && !sessionId.isEmpty()) {
            return sessionId;
        }
        return request.getSession().getId();
    }
}
