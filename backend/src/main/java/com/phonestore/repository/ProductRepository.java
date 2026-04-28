package com.phonestore.repository;

import com.phonestore.entity.Product;
import com.phonestore.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.isActive = true AND p.deletedAt IS NULL")
    Page<Product> findByStatusAndActive(@Param("status") ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isFeatured = true AND p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    List<Product> findFeaturedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.deletedAt IS NULL ORDER BY p.soldCount DESC")
    List<Product> findBestSellers(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId AND p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    Page<Product> findByBrandId(@Param("brandId") Long brandId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
           "(:minPrice IS NULL OR p.salePrice >= :minPrice OR (p.salePrice IS NULL AND p.basePrice >= :minPrice)) AND " +
           "(:maxPrice IS NULL OR p.salePrice <= :maxPrice OR (p.salePrice IS NULL AND p.basePrice <= :maxPrice)) AND " +
           "p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    Page<Product> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Product p SET p.viewCount = p.viewCount + 1 WHERE p.id = :productId")
    void incrementViewCount(@Param("productId") Long productId);

    @Query("SELECT p FROM Product p WHERE p.name LIKE %:keyword% OR p.shortDescription LIKE %:keyword% AND p.status = 'ACTIVE' AND p.deletedAt IS NULL")
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);
}
