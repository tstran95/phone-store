package com.phonestore.service;

import com.phonestore.dto.request.ProductSearchRequest;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.dto.response.ProductResponse;
import com.phonestore.entity.Brand;
import com.phonestore.entity.Category;
import com.phonestore.entity.Product;
import com.phonestore.enums.ProductStatus;
import com.phonestore.repository.BrandRepository;
import com.phonestore.repository.CategoryRepository;
import com.phonestore.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BrandRepository brandRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private Category testCategory;
    private Brand testBrand;

    @BeforeEach
    void setUp() {
        testCategory = Category.builder()
                .id(1L)
                .name("Điện thoại")
                .slug("dien-thoai")
                .build();

        testBrand = Brand.builder()
                .id(1L)
                .name("Apple")
                .slug("apple")
                .build();

        testProduct = Product.builder()
                .id(1L)
                .sku("IP15-128")
                .name("iPhone 15 128GB")
                .slug("iphone-15-128gb")
                .shortDescription("Latest iPhone")
                .basePrice(BigDecimal.valueOf(22000000))
                .salePrice(BigDecimal.valueOf(20000000))
                .category(testCategory)
                .brand(testBrand)
                .status(ProductStatus.ACTIVE)
                .isActive(true)
                .viewCount(100)
                .soldCount(50)
                .ratingAverage(BigDecimal.valueOf(4.5))
                .ratingCount(10)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should search products successfully")
    void searchProducts_Success() {
        List<Product> products = List.of(testProduct);
        Page<Product> productPage = new PageImpl<>(products);

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(productPage);

        ProductSearchRequest request = ProductSearchRequest.builder()
                .keyword("iPhone")
                .categoryId(1L)
                .page(0)
                .size(20)
                .build();

        PagedResponse<ProductResponse> response = productService.searchProducts(request);

        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals(testProduct.getName(), response.getContent().get(0).getName());
        assertEquals(20, response.getContent().get(0).getDiscountPercent());
        verify(productRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Should get product by slug")
    void getProductBySlug_Success() {
        when(productRepository.findBySlug(testProduct.getSlug()))
                .thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).incrementViewCount(testProduct.getId());

        ProductResponse response = productService.getProductBySlug(testProduct.getSlug());

        assertNotNull(response);
        assertEquals(testProduct.getName(), response.getName());
        assertEquals(testProduct.getSlug(), response.getSlug());
        verify(productRepository).incrementViewCount(testProduct.getId());
    }

    @Test
    @DisplayName("Should throw exception when product not found")
    void getProductBySlug_NotFound() {
        when(productRepository.findBySlug("non-existent"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> productService.getProductBySlug("non-existent"));

        assertEquals("Không tìm thấy sản phẩm", exception.getMessage());
    }

    @Test
    @DisplayName("Should get featured products")
    void getFeaturedProducts_Success() {
        when(productRepository.findFeaturedProducts(any()))
                .thenReturn(List.of(testProduct));

        List<ProductResponse> response = productService.getFeaturedProducts(10);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(testProduct.getName(), response.get(0).getName());
    }

    @Test
    @DisplayName("Should calculate discount percent correctly")
    void calculateDiscountPercent() {
        when(productRepository.findBySlug(testProduct.getSlug()))
                .thenReturn(Optional.of(testProduct));
        doNothing().when(productRepository).incrementViewCount(any());

        ProductResponse response = productService.getProductBySlug(testProduct.getSlug());

        assertEquals(9, response.getDiscountPercent()); // (22-20)/22 * 100 = 9%
    }
}
