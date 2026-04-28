package com.phonestore.service;

import com.phonestore.dto.request.WishlistRequest;
import com.phonestore.dto.response.WishlistResponse;
import com.phonestore.entity.Product;
import com.phonestore.entity.User;
import com.phonestore.entity.Wishlist;
import com.phonestore.repository.ProductRepository;
import com.phonestore.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }

    @Transactional
    public WishlistResponse addToWishlist(Long userId, WishlistRequest request) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new RuntimeException("Sản phẩm đã có trong danh sách yêu thích");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Wishlist wishlist = Wishlist.builder()
                .user(User.builder().id(userId).build())
                .product(product)
                .notifyWhenAvailable(request.getNotifyWhenAvailable() != null ? request.getNotifyWhenAvailable() : false)
                .build();

        wishlistRepository.save(wishlist);
        log.info("User {} added product {} to wishlist", userId, request.getProductId());
        return mapToResponse(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("User {} removed product {} from wishlist", userId, productId);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    private WishlistResponse mapToResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        boolean inStock = product.getTotalStock() > 0;
        String imageUrl = product.getImages() != null && !product.getImages().isEmpty()
                ? product.getImages().get(0).getImageUrl()
                : null;

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .product(WishlistResponse.ProductSummary.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .slug(product.getSlug())
                        .imageUrl(imageUrl)
                        .basePrice(product.getBasePrice())
                        .salePrice(product.getSalePrice())
                        .discountPercent(product.getDiscountPercent())
                        .inStock(inStock)
                        .build())
                .addedAt(wishlist.getAddedAt())
                .notifyWhenAvailable(wishlist.getNotifyWhenAvailable())
                .build();
    }
}
