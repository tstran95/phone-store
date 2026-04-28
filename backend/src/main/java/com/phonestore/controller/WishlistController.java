package com.phonestore.controller;

import com.phonestore.dto.request.WishlistRequest;
import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.WishlistResponse;
import com.phonestore.entity.User;
import com.phonestore.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getUserWishlist(user.getId())));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlistCount(user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody WishlistRequest request) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.addToWishlist(user.getId(), request)));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(
            @AuthenticationPrincipal User user,
            @RequestParam Long productId) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.isInWishlist(user.getId(), productId)));
    }
}
