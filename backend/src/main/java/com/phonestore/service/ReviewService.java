package com.phonestore.service;

import com.phonestore.dto.request.ReviewRequest;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.ReviewResponse;
import com.phonestore.dto.response.ReviewStatsResponse;
import com.phonestore.entity.Product;
import com.phonestore.entity.Review;
import com.phonestore.entity.User;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByProductIdAndIsApprovedTrue(productId, pageable);

        return PagedResponse.<ReviewResponse>builder()
                .content(reviewPage.getContent().stream().map(this::mapToResponse).toList())
                .pageNumber(reviewPage.getNumber())
                .pageSize(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .last(reviewPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ReviewStatsResponse getReviewStats(Long productId, Long userId) {
        Double avg = reviewRepository.calculateAverageRating(productId);
        Long total = reviewRepository.countByProductId(productId);

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            distribution.put(i, 0L);
        }
        for (Object[] row : reviewRepository.getRatingDistribution(productId)) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(rating, count);
        }

        boolean canReview = false;
        if (userId != null) {
            long completedOrders = orderRepository.countByUserIdAndStatus(userId, com.phonestore.enums.OrderStatus.DELIVERED);
            canReview = completedOrders > 0;
        }

        return ReviewStatsResponse.builder()
                .averageRating(avg != null ? BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                .totalReviews(total != null ? total : 0L)
                .ratingDistribution(distribution)
                .canReview(canReview)
                .build();
    }

    @Transactional
    public ReviewResponse createReview(Long userId, Long productId, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Review review = Review.builder()
                .product(product)
                .user(User.builder().id(userId).build())
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .order(request.getOrderId() != null ? com.phonestore.entity.Order.builder().id(request.getOrderId()).build() : null)
                .isVerifiedPurchase(request.getOrderId() != null)
                .isApproved(true)
                .build();

        Review saved = reviewRepository.save(review);

        updateProductRating(productId);
        log.info("User {} created review for product {}", userId, productId);
        return mapToResponse(saved);
    }

    @Transactional
    public void markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá"));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    private void updateProductRating(Long productId) {
        Double avg = reviewRepository.calculateAverageRating(productId);
        Long count = reviewRepository.countByProductId(productId);

        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setRatingAverage(avg != null ? BigDecimal.valueOf(avg) : BigDecimal.valueOf(5.0));
            product.setRatingCount(count != null ? count.intValue() : 0);
            productRepository.save(product);
        }
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .helpfulCount(review.getHelpfulCount())
                .unhelpfulCount(review.getUnhelpfulCount())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .reviewer(ReviewResponse.ReviewerInfo.builder()
                        .id(review.getUser().getId())
                        .fullName(review.getUser().getFullName())
                        .avatarUrl(review.getUser().getAvatarUrl())
                        .build())
                .build();
    }
}
