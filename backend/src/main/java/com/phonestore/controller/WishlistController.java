package com.phonestore.controller;

import com.phonestore.dto.request.WishlistRequest;
import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.WishlistResponse;
import com.phonestore.entity.User;
import com.phonestore.service.WishlistService;
import com.phonestore.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = auth.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getUserWishlist(user.getId())));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlistCount(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @Valid @RequestBody WishlistRequest request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(wishlistService.addToWishlist(user.getId(), request)));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @PathVariable Long productId) {
        User user = getCurrentUser();
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(
            @RequestParam Long productId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(wishlistService.isInWishlist(user.getId(), productId)));
    }
}
