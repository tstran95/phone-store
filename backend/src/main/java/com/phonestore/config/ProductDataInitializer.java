package com.phonestore.config;

import com.phonestore.entity.*;
import com.phonestore.enums.ProductStatus;
import com.phonestore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Products already exist, skipping initialization");
            return;
        }

        log.info("Initializing sample products...");

        // Get or create categories
        Category phoneCat = getOrCreateCategory("Điện thoại", "dien-thoai");
        Category laptopCat = getOrCreateCategory("Laptop", "laptop");
        Category tabletCat = getOrCreateCategory("Máy tính bảng", "may-tinh-bang");
        Category watchCat = getOrCreateCategory("Đồng hồ thông minh", "dong-ho-thong-minh");
        Category accessoryCat = getOrCreateCategory("Phụ kiện", "phu-kien");

        // Get or create brands
        Brand apple = getOrCreateBrand("Apple", "apple", "USA");
        Brand samsung = getOrCreateBrand("Samsung", "samsung", "Korea");
        Brand xiaomi = getOrCreateBrand("Xiaomi", "xiaomi", "China");
        Brand oppo = getOrCreateBrand("OPPO", "oppo", "China");
        Brand dell = getOrCreateBrand("Dell", "dell", "USA");
        Brand hp = getOrCreateBrand("HP", "hp", "USA");

        // Create iPhone products
        createProductWithImages(
            "iPhone 15 Pro Max 256GB",
            "iphone-15-pro-max-256gb",
            apple,
            phoneCat,
            new BigDecimal("34990000"),
            new BigDecimal("32490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-15-pro-max_3_.png",
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-15-pro-max-1.png",
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-15-pro-max-2.png"
            )
        );

        createProductWithImages(
            "iPhone 15 Pro 128GB",
            "iphone-15-pro-128gb",
            apple,
            phoneCat,
            new BigDecimal("27990000"),
            new BigDecimal("25490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-15-pro_3_.png"
            )
        );

        createProductWithImages(
            "iPhone 15 128GB",
            "iphone-15-128gb",
            apple,
            phoneCat,
            new BigDecimal("22990000"),
            new BigDecimal("20990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-15.png"
            )
        );

        createProductWithImages(
            "iPhone 14 Pro Max 256GB",
            "iphone-14-pro-max-256gb",
            apple,
            phoneCat,
            new BigDecimal("29990000"),
            new BigDecimal("27490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/iphone-14-pro-max-1.png"
            )
        );

        // Create Samsung products
        createProductWithImages(
            "Samsung Galaxy S24 Ultra 256GB",
            "samsung-galaxy-s24-ultra-256gb",
            samsung,
            phoneCat,
            new BigDecimal("32990000"),
            new BigDecimal("29990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-s24-ultra-xam_1.png",
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-s24-ultra-xam_2.png"
            )
        );

        createProductWithImages(
            "Samsung Galaxy S24+ 256GB",
            "samsung-galaxy-s24-plus-256gb",
            samsung,
            phoneCat,
            new BigDecimal("24990000"),
            new BigDecimal("22990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-s24-plus-tim_1.png"
            )
        );

        createProductWithImages(
            "Samsung Galaxy Z Fold 5 256GB",
            "samsung-galaxy-z-fold-5-256gb",
            samsung,
            phoneCat,
            new BigDecimal("41990000"),
            new BigDecimal("38990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-z-fold-5_1.png"
            )
        );

        createProductWithImages(
            "Samsung Galaxy Z Flip 5 256GB",
            "samsung-galaxy-z-flip-5-256gb",
            samsung,
            phoneCat,
            new BigDecimal("22990000"),
            new BigDecimal("19990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-z-flip-5_1.png"
            )
        );

        // Create Xiaomi products
        createProductWithImages(
            "Xiaomi 14 Ultra",
            "xiaomi-14-ultra",
            xiaomi,
            phoneCat,
            new BigDecimal("29990000"),
            new BigDecimal("27490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/x/i/xiaomi-14-ultra-1.png"
            )
        );

        createProductWithImages(
            "Xiaomi Redmi Note 13 Pro 5G",
            "xiaomi-redmi-note-13-pro-5g",
            xiaomi,
            phoneCat,
            new BigDecimal("8490000"),
            new BigDecimal("7490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/r/e/redmi-note-13-pro-5g-1.png"
            )
        );

        createProductWithImages(
            "Xiaomi 14 Pro",
            "xiaomi-14-pro",
            xiaomi,
            phoneCat,
            new BigDecimal("19990000"),
            new BigDecimal("17990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/x/i/xiaomi-14-pro-1.png"
            )
        );

        // Create OPPO products
        createProductWithImages(
            "OPPO Find X7 Ultra",
            "oppo-find-x7-ultra",
            oppo,
            phoneCat,
            new BigDecimal("27990000"),
            new BigDecimal("25990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/o/p/oppo-find-x7-ultra-1.png"
            )
        );

        createProductWithImages(
            "OPPO Reno 12 Pro",
            "oppo-reno-12-pro",
            oppo,
            phoneCat,
            new BigDecimal("14990000"),
            new BigDecimal("13490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/o/p/oppo-reno12-pro-1.png"
            )
        );

        // Create Dell laptop
        createProductWithImages(
            "Dell XPS 15 9530",
            "dell-xps-15-9530",
            dell,
            laptopCat,
            new BigDecimal("54990000"),
            new BigDecimal("49990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/x/p/xps-15-9530.png"
            )
        );

        createProductWithImages(
            "Dell Inspiron 15 3530",
            "dell-inspiron-15-3530",
            dell,
            laptopCat,
            new BigDecimal("18990000"),
            new BigDecimal("16990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/d/e/dell-inspiron-15-3530-1.png"
            )
        );

        // Create HP laptop
        createProductWithImages(
            "HP Pavilion 15 eg3006TU",
            "hp-pavilion-15-eg3006tu",
            hp,
            laptopCat,
            new BigDecimal("21990000"),
            new BigDecimal("19990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/h/p/hp-pavilion-15-eg3006tu-1.png"
            )
        );

        // Create iPad
        createProductWithImages(
            "iPad Pro M4 11 inch 256GB",
            "ipad-pro-m4-11-inch-256gb",
            apple,
            tabletCat,
            new BigDecimal("27990000"),
            new BigDecimal("25990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/ipad-pro-13-2024-wifi-256gb-bac-1.png"
            )
        );

        createProductWithImages(
            "iPad Air M2 13 inch",
            "ipad-air-m2-13-inch",
            apple,
            tabletCat,
            new BigDecimal("22990000"),
            new BigDecimal("20990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/i/p/ipad-air-13-2024-wifi-256gb-xanh-la-1.png"
            )
        );

        // Create Apple Watch
        createProductWithImages(
            "Apple Watch Ultra 2",
            "apple-watch-ultra-2",
            apple,
            watchCat,
            new BigDecimal("19990000"),
            new BigDecimal("18490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/a/p/apple-watch-ultra-2-1.png"
            )
        );

        createProductWithImages(
            "Apple Watch Series 9 45mm",
            "apple-watch-series-9-45mm",
            apple,
            watchCat,
            new BigDecimal("11990000"),
            new BigDecimal("10990000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/a/p/apple-watch-s9-45mm-1.png"
            )
        );

        // Create Samsung Watch
        createProductWithImages(
            "Samsung Galaxy Watch 7 Ultra",
            "samsung-galaxy-watch-7-ultra",
            samsung,
            watchCat,
            new BigDecimal("11990000"),
            new BigDecimal("10490000"),
            Arrays.asList(
                "https://cdn2.cellphones.com.vn/x358,358/media/catalog/product/s/a/samsung-galaxy-watch-7-ultra-1.png"
            )
        );

        log.info("Sample products initialized successfully!");
    }

    private Category getOrCreateCategory(String name, String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseGet(() -> {
                    Category cat = Category.builder()
                            .name(name)
                            .slug(slug)
                            .isActive(true)
                            .build();
                    return categoryRepository.save(cat);
                });
    }

    private Brand getOrCreateBrand(String name, String slug, String country) {
        return brandRepository.findBySlug(slug)
                .orElseGet(() -> {
                    Brand brand = Brand.builder()
                            .name(name)
                            .slug(slug)
                            .country(country)
                            .isActive(true)
                            .build();
                    return brandRepository.save(brand);
                });
    }

    private void createProductWithImages(String name, String slug, Brand brand, Category category,
                                        BigDecimal basePrice, BigDecimal salePrice, List<String> imageUrls) {
        Product product = Product.builder()
                .name(name)
                .slug(slug)
                .brand(brand)
                .category(category)
                .basePrice(basePrice)
                .salePrice(salePrice)
                .status(ProductStatus.ACTIVE)
                .isActive(true)
                .isFeatured(true)
                .description(getProductDescription(name))
                .shortDescription("Sản phẩm chính hãng, bảo hành 12 tháng")
                .build();

        Product savedProduct = productRepository.save(product);

        // Create product images
        for (int i = 0; i < imageUrls.size(); i++) {
            ProductImage image = ProductImage.builder()
                    .product(savedProduct)
                    .imageUrl(imageUrls.get(i))
                    .isPrimary(i == 0)
                    .displayOrder(i)
                    .build();
            productImageRepository.save(image);
        }

        // Create default variant
        ProductVariant variant = ProductVariant.builder()
                .product(savedProduct)
                .sku("SKU-" + savedProduct.getId())
                .variantName("Mặc định")
                .attributes(java.util.Collections.emptyMap())
                .stockQuantity(50)
                .isActive(true)
                .build();
        productVariantRepository.save(variant);

        log.info("Created product: {}", name);
    }

    private String getProductDescription(String productName) {
        return "<h2>Đặc điểm nổi bật</h2>" +
                "<p>Máy nguyên seal, chính hãng Apple Việt Nam hoặc quốc tế.</p>" +
                "<p>Bảo hành 12 tháng theo tiêu chuẩn nhà sản xuất.</p>" +
                "<h3>Thông số kỹ thuật</h3>" +
                "<ul>" +
                "<li>Màn hình: Super Retina XDR OLED</li>" +
                "<li>Chipset: A17 Pro</li>" +
                "<li>RAM: 8GB</li>" +
                "<li>Bộ nhớ trong: 256GB</li>" +
                "<li>Camera: 48MP + 12MP + 12MP</li>" +
                "<li>Pin: 4422mAh</li>" +
                "<li>Hệ điều hành: iOS 17</li>" +
                "</ul>";
    }
}
