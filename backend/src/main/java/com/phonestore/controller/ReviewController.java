package com.phonestore.controller;

import com.phonestore.dto.request.ReviewRequest;
import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.ReviewResponse;
import com.phonestore.dto.response.ReviewStatsResponse;
import com.phonestore.entity.User;
import com.phonestore.service.ReviewService;
import com.phonestore.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        return userService.findByEmail(email).orElse(null);
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @GetMapping("/products/{productId}/reviews/stats")
    public ResponseEntity<ApiResponse<ReviewStatsResponse>> getReviewStats(@PathVariable Long productId) {
        User user = getCurrentUser();
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewStats(productId, userId)));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized", null));
        }
        return ResponseEntity.ok(ApiResponse.success(reviewService.createReview(user.getId(), productId, request)));
    }

    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable Long reviewId) {
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Marked as helpful", null));
    }
}
