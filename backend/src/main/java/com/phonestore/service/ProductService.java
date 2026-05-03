package com.phonestore.service;

import com.phonestore.dto.request.ProductSearchRequest;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.ProductResponse;
import com.phonestore.entity.Brand;
import com.phonestore.entity.Category;
import com.phonestore.entity.Product;
import com.phonestore.enums.ProductSortField;
import com.phonestore.enums.ProductStatus;
import com.phonestore.repository.BrandRepository;
import com.phonestore.repository.CategoryRepository;
import com.phonestore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(ProductSearchRequest request) {
        Pageable pageable = createPageable(request);
        Specification<Product> spec = createSpecification(request);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> content = productPage.getContent()
                .stream()
                .map(this::mapToProductResponse)
                .toList();

        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        // Increment view count asynchronously
        productRepository.incrementViewCount(product.getId());

        return mapToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        return mapToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts(int limit) {
        return productRepository.findFeaturedProducts(PageRequest.of(0, limit))
                .stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getBestSellers(int limit) {
        return productRepository.findBestSellers(PageRequest.of(0, limit))
                .stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals(int limit) {
        return productRepository.findNewArrivals(PageRequest.of(0, limit))
                .stream()
                .map(this::mapToProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        return productRepository.findByCategoryId(product.getCategory().getId(), PageRequest.of(0, limit))
                .getContent()
                .stream()
                .filter(p -> !p.getId().equals(productId))
                .map(this::mapToProductResponse)
                .toList();
    }

    private Pageable createPageable(ProductSearchRequest request) {
        Sort sort = createSort(request.getSortBy(), request.getSortDirection());
        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }

    private Sort createSort(ProductSortField sortBy, String direction) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;

        return switch (sortBy) {
            case PRICE -> Sort.by(dir, "salePrice").and(Sort.by(dir, "basePrice"));
            case NAME -> Sort.by(dir, "name");
            case SOLD_COUNT -> Sort.by(dir, "soldCount");
            case RATING -> Sort.by(dir, "ratingAverage");
            default -> Sort.by(dir, "createdAt");
        };
    }

    private Specification<Product> createSpecification(ProductSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status and active
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));
            predicates.add(cb.isTrue(root.get("isActive")));
            predicates.add(cb.isNull(root.get("deletedAt")));

            // Keyword search
            if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), keyword);
                Predicate descPredicate = cb.like(cb.lower(root.get("shortDescription")), keyword);
                predicates.add(cb.or(namePredicate, descPredicate));
            }

            // Category filter
            if (request.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            // Brand filter
            if (request.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), request.getBrandId()));
            }

            // Price range
            if (request.getMinPrice() != null) {
                predicates.add(cb.or(
                        cb.and(cb.isNotNull(root.get("salePrice")),
                                cb.greaterThanOrEqualTo(root.get("salePrice"), request.getMinPrice())),
                        cb.and(cb.isNull(root.get("salePrice")),
                                cb.greaterThanOrEqualTo(root.get("basePrice"), request.getMinPrice()))
                ));
            }

            if (request.getMaxPrice() != null) {
                predicates.add(cb.or(
                        cb.and(cb.isNotNull(root.get("salePrice")),
                                cb.lessThanOrEqualTo(root.get("salePrice"), request.getMaxPrice())),
                        cb.and(cb.isNull(root.get("salePrice")),
                                cb.lessThanOrEqualTo(root.get("basePrice"), request.getMaxPrice()))
                ));
            }

            // Featured
            if (request.getIsFeatured() != null) {
                predicates.add(cb.equal(root.get("isFeatured"), request.getIsFeatured()));
            }

            // Has discount
            if (request.getHasDiscount() != null && request.getHasDiscount()) {
                predicates.add(cb.and(
                        cb.isNotNull(root.get("salePrice")),
                        cb.lessThan(root.get("salePrice"), root.get("basePrice"))
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private ProductResponse mapToProductResponse(Product product) {
        Category category = product.getCategory();
        Brand brand = product.getBrand();

        return ProductResponse.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .shortDescription(product.getShortDescription())
                .basePrice(product.getBasePrice())
                .salePrice(product.getSalePrice())
                .discountPercent(calculateDiscountPercent(product))
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .viewCount(product.getViewCount())
                .soldCount(product.getSoldCount())
                .ratingAverage(product.getRatingAverage())
                .ratingCount(product.getRatingCount())
                .category(category != null ? ProductResponse.CategoryInfo.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .slug(category.getSlug())
                        .build() : null)
                .brand(brand != null ? ProductResponse.BrandInfo.builder()
                        .id(brand.getId())
                        .name(brand.getName())
                        .slug(brand.getSlug())
                        .logoUrl(brand.getLogoUrl())
                        .build() : null)
                .variants(product.getVariants() != null ?
                        product.getVariants().stream()
                                .map(v -> ProductResponse.VariantInfo.builder()
                                        .id(v.getId())
                                        .sku(v.getSku())
                                        .variantName(v.getVariantName())
                                        .priceAdjustment(v.getPriceAdjustment())
                                        .stockQuantity(v.getStockQuantity())
                                        .imageUrl(v.getImageUrl())
                                        .build())
                                .toList() : List.of())
                .images(product.getImages() != null ?
                        product.getImages().stream()
                                .map(i -> ProductResponse.ImageInfo.builder()
                                        .id(i.getId())
                                        .imageUrl(i.getImageUrl())
                                        .altText(i.getAltText())
                                        .isPrimary(i.getIsPrimary())
                                        .displayOrder(i.getDisplayOrder())
                                        .build())
                                .toList() : List.of())
                .createdAt(product.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchByKeyword(String keyword, Pageable pageable) {
        Page<Product> productPage = productRepository.searchByKeyword(keyword, pageable);

        List<ProductResponse> content = productPage.getContent()
                .stream()
                .map(this::mapToProductResponse)
                .toList();

        return PagedResponse.<ProductResponse>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    private Integer calculateDiscountPercent(Product product) {
        if (product.getSalePrice() == null || product.getBasePrice() == null) {
            return 0;
        }
        if (product.getSalePrice().compareTo(product.getBasePrice()) >= 0) {
            return 0;
        }
        BigDecimal diff = product.getBasePrice().subtract(product.getSalePrice());
        return diff.multiply(BigDecimal.valueOf(100))
                .divide(product.getBasePrice(), 0, BigDecimal.ROUND_HALF_UP)
                .intValue();
    }

    // ==================== ADMIN METHODS ====================

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProductsForAdmin(String search, Boolean active, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("sku")), "%" + search.toLowerCase() + "%")
                ));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("isActive"), active));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable)
                .map(this::mapToProductResponse);
    }

    @Transactional
    public ProductResponse createProduct(com.phonestore.controller.ProductRequest request) {
        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, com.phonestore.controller.ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setBasePrice(request.getBasePrice());
        product.setSalePrice(request.getSalePrice());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found"));
            product.setBrand(brand);
        }

        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setIsActive(active);
        Product saved = productRepository.save(product);
        return mapToProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public long countProducts() {
        return productRepository.count();
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getTopSellingProducts(int limit) {
        return productRepository.findBestSellers(PageRequest.of(0, limit))
                .stream()
                .map(p -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", p.getId());
                    map.put("name", p.getName());
                    map.put("sku", p.getSku());
                    map.put("soldCount", p.getSoldCount());
                    map.put("basePrice", p.getBasePrice());
                    return map;
                })
                .toList();
    }
}
