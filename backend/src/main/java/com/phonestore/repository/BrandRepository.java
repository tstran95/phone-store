package com.phonestore.repository;

import com.phonestore.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {

    Optional<Brand> findBySlug(String slug);

    List<Brand> findByIsActiveTrue();

    boolean existsBySlug(String slug);

    @Query("SELECT DISTINCT b FROM Brand b JOIN Product p ON p.brand.id = b.id WHERE p.category.id = :categoryId AND b.isActive = true")
    List<Brand> findByCategoryId(@Param("categoryId") Long categoryId);
}
