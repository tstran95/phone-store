package com.phonestore.controller;

import com.phonestore.dto.response.ApiResponse;
import com.phonestore.entity.Brand;
import com.phonestore.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Brand>>> getAllBrands(
            @RequestParam(required = false) Long categoryId) {
        List<Brand> brands;
        if (categoryId != null) {
            brands = brandRepository.findByCategoryId(categoryId);
        } else {
            brands = brandRepository.findByIsActiveTrueOrderByNameAsc();
        }
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<Brand>> getBrandBySlug(@PathVariable String slug) {
        Brand brand = brandRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        return ResponseEntity.ok(ApiResponse.success(brand));
    }
}
