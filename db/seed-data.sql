-- ============================================
-- SEED DATA FOR PHONE STORE
-- ============================================

USE phonestore_db;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT IGNORE INTO categories (id, name, slug, description, display_order, is_active) VALUES
(1, 'Điện thoại', 'dien-thoai', 'Điện thoại di động thông minh', 1, TRUE),
(2, 'Laptop', 'laptop', 'Máy tính xách tay', 2, TRUE),
(3, 'Máy tính bảng', 'may-tinh-bang', 'Tablet', 3, TRUE),
(4, 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Smart Watch', 4, TRUE),
(5, 'Phụ kiện', 'phu-kien', 'Phụ kiện điện thoại', 5, TRUE);

-- ============================================
-- BRANDS
-- ============================================
INSERT IGNORE INTO brands (id, name, slug, description, country, is_active) VALUES
(1, 'Apple', 'apple', 'Apple Inc.', 'USA', TRUE),
(2, 'Samsung', 'samsung', 'Samsung Electronics', 'Korea', TRUE),
(3, 'Xiaomi', 'xiaomi', 'Xiaomi Corporation', 'China', TRUE),
(4, 'Oppo', 'oppo', 'OPPO Electronics', 'China', TRUE),
(5, 'Vivo', 'vivo', 'Vivo Communication', 'China', TRUE);

-- ============================================
-- PRODUCTS - iPhone (IDs 1-5)
-- ============================================
INSERT INTO products (id, sku, name, slug, description, short_description, category_id, brand_id, base_price, sale_price, is_active, is_featured, status, rating_average, rating_count, view_count, sold_count) VALUES
(1, 'IP15PM-256', 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'iPhone 15 Pro Max với chip A17 Pro, màn hình Super Retina XDR 6.7 inch', 'Chip A17 Pro, màn hình 6.7 inch, camera 48MP', 1, 1, 34990000, 32990000, TRUE, TRUE, 'ACTIVE', 4.8, 1250, 50000, 3200),
(2, 'IP15P-256', 'iPhone 15 Pro 256GB', 'iphone-15-pro-256gb', 'iPhone 15 Pro với chip A17 Pro, màn hình Super Retina XDR 6.1 inch', 'Chip A17 Pro, màn hình 6.1 inch, camera 48MP', 1, 1, 31990000, 29990000, TRUE, TRUE, 'ACTIVE', 4.7, 980, 42000, 2800),
(3, 'IP15-128', 'iPhone 15 128GB', 'iphone-15-128gb', 'iPhone 15 với chip A16 Bionic, Dynamic Island', 'Chip A16 Bionic, Dynamic Island, camera 48MP', 1, 1, 22990000, 21490000, TRUE, TRUE, 'ACTIVE', 4.6, 850, 38000, 4500),
(4, 'IP14-128', 'iPhone 14 128GB', 'iphone-14-128gb', 'iPhone 14 với chip A15 Bionic', 'Chip A15 Bionic, camera kép 12MP', 1, 1, 18990000, 17490000, TRUE, FALSE, 'ACTIVE', 4.5, 2100, 65000, 8900),
(5, 'IP13-128', 'iPhone 13 128GB', 'iphone-13-128gb', 'iPhone 13 với chip A15 Bionic', 'Chip A15 Bionic, pin trâu', 1, 1, 15990000, 14490000, TRUE, FALSE, 'ACTIVE', 4.7, 3200, 78000, 12000);

-- ============================================
-- PRODUCTS - Samsung (IDs 6-11)
-- ============================================
INSERT INTO products (id, sku, name, slug, description, short_description, category_id, brand_id, base_price, sale_price, is_active, is_featured, status, rating_average, rating_count, view_count, sold_count) VALUES
(6, 'SS-S24U-256', 'Samsung Galaxy S24 Ultra 256GB', 'samsung-galaxy-s24-ultra-256gb', 'Galaxy S24 Ultra với S Pen, AI Galaxy, camera 200MP', 'S Pen tích hợp, AI Galaxy, camera 200MP', 1, 2, 33990000, 31490000, TRUE, TRUE, 'ACTIVE', 4.7, 890, 35000, 2100),
(7, 'SS-S24P-256', 'Samsung Galaxy S24+ 256GB', 'samsung-galaxy-s24-plus-256gb', 'Galaxy S24+ với AI Galaxy, màn hình QHD+', 'AI Galaxy, màn hình QHD+ 6.7 inch', 1, 2, 26990000, 24990000, TRUE, TRUE, 'ACTIVE', 4.6, 650, 28000, 1800),
(8, 'SS-S24-128', 'Samsung Galaxy S24 128GB', 'samsung-galaxy-s24-128gb', 'Galaxy S24 với AI Galaxy', 'AI Galaxy, màn hình FHD+ 6.2 inch', 1, 2, 22990000, 20990000, TRUE, TRUE, 'ACTIVE', 4.5, 720, 25000, 2400),
(9, 'SS-ZF5-256', 'Samsung Galaxy Z Fold5 256GB', 'samsung-galaxy-z-fold5-256gb', 'Điện thoại gập Galaxy Z Fold5', 'Màn hình gập 7.6 inch, đa nhiệm tuyệt vờii', 1, 2, 40990000, 36990000, TRUE, TRUE, 'ACTIVE', 4.6, 450, 22000, 890),
(10, 'SS-ZF5-512', 'Samsung Galaxy Z Fold5 512GB', 'samsung-galaxy-z-fold5-512gb', 'Điện thoại gập Galaxy Z Fold5 512GB', 'Màn hình gập 7.6 inch, bộ nhớ 512GB', 1, 2, 45990000, 41990000, TRUE, FALSE, 'ACTIVE', 4.7, 280, 18000, 650),
(11, 'SS-A55-128', 'Samsung Galaxy A55 128GB', 'samsung-galaxy-a55-128gb', 'Galaxy A55 5G tầm trung', '5G, camera 50MP, pin 5000mAh', 1, 2, 9990000, 8990000, TRUE, FALSE, 'ACTIVE', 4.4, 1200, 30000, 5600);

-- ============================================
-- PRODUCTS - Xiaomi (IDs 12-15)
-- ============================================
INSERT INTO products (id, sku, name, slug, description, short_description, category_id, brand_id, base_price, sale_price, is_active, is_featured, status, rating_average, rating_count, view_count, sold_count) VALUES
(12, 'XM-14-256', 'Xiaomi 14 256GB', 'xiaomi-14-256gb', 'Xiaomi 14 với Snapdragon 8 Gen 3, camera Leica', 'Snapdragon 8 Gen 3, camera Leica', 1, 3, 21990000, 19990000, TRUE, TRUE, 'ACTIVE', 4.5, 560, 22000, 1500),
(13, 'XM-14U-512', 'Xiaomi 14 Ultra 512GB', 'xiaomi-14-ultra-512gb', 'Xiaomi 14 Ultra camera Leica 1 inch', 'Camera Leica 1 inch, Snapdragon 8 Gen 3', 1, 3, 32990000, 30990000, TRUE, TRUE, 'ACTIVE', 4.6, 420, 18000, 980),
(14, 'XM-13T-256', 'Xiaomi 13T Pro 256GB', 'xiaomi-13t-pro-256gb', 'Xiaomi 13T Pro camera Leica', 'Camera Leica, sạc 120W', 1, 3, 14990000, 13490000, TRUE, FALSE, 'ACTIVE', 4.4, 780, 25000, 2100),
(15, 'XM-RS13-256', 'Redmi Note 13 Pro+ 256GB', 'redmi-note-13-pro-plus-256gb', 'Redmi Note 13 Pro+ 5G', 'Camera 200MP, sạc 120W, chống nước IP68', 1, 3, 8490000, 7490000, TRUE, FALSE, 'ACTIVE', 4.3, 1100, 28000, 4200);

-- ============================================
-- PRODUCTS - Oppo (IDs 16-18)
-- ============================================
INSERT INTO products (id, sku, name, slug, description, short_description, category_id, brand_id, base_price, sale_price, is_active, is_featured, status, rating_average, rating_count, view_count, sold_count) VALUES
(16, 'OP-FX7-256', 'OPPO Find X7 Ultra 256GB', 'oppo-find-x7-ultra-256gb', 'OPPO Find X7 Ultra camera Hasselblad', 'Camera Hasselblad, Snapdragon 8 Gen 3', 1, 4, 27990000, 25990000, TRUE, TRUE, 'ACTIVE', 4.5, 380, 16000, 890),
(17, 'OP-R12-256', 'OPPO Reno12 Pro 256GB', 'oppo-reno12-pro-256gb', 'OPPO Reno12 Pro thiết kế đẹp', 'Thiết kế đẹp, AI camera', 1, 4, 14990000, 13990000, TRUE, FALSE, 'ACTIVE', 4.4, 620, 20000, 1800),
(18, 'OP-A98-128', 'OPPO A98 128GB', 'oppo-a98-128gb', 'OPPO A98 5G tầm trung', '5G, sạc nhanh 67W', 1, 4, 7990000, 6990000, TRUE, FALSE, 'ACTIVE', 4.2, 890, 24000, 3200);

-- Reset auto_increment
ALTER TABLE products AUTO_INCREMENT = 100;

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
INSERT INTO product_variants (product_id, sku, variant_name, attributes, price_adjustment, stock_quantity, is_active) VALUES
-- iPhone 15 Pro Max variants
(1, 'IP15PM-256-TN', '256GB - Titan Tự Nhiên', '{"color": "Titan Tự Nhiên", "storage": "256GB"}', 0, 50, TRUE),
(1, 'IP15PM-256-TX', '256GB - Titan Xanh', '{"color": "Titan Xanh", "storage": "256GB"}', 0, 45, TRUE),
(1, 'IP15PM-256-TD', '256GB - Titan Đen', '{"color": "Titan Đen", "storage": "256GB"}', 0, 40, TRUE),
(1, 'IP15PM-512-TN', '512GB - Titan Tự Nhiên', '{"color": "Titan Tự Nhiên", "storage": "512GB"}', 5000000, 30, TRUE),
-- iPhone 15 variants
(3, 'IP15-128-X', '128GB - Xanh', '{"color": "Xanh", "storage": "128GB"}', 0, 60, TRUE),
(3, 'IP15-128-H', '128GB - Hồng', '{"color": "Hồng", "storage": "128GB"}', 0, 55, TRUE),
(3, 'IP15-128-V', '128GB - Vàng', '{"color": "Vàng", "storage": "128GB"}', 0, 50, TRUE),
(3, 'IP15-256-X', '256GB - Xanh', '{"color": "Xanh", "storage": "256GB"}', 3000000, 40, TRUE),
-- Samsung S24 Ultra variants
(6, 'SS-S24U-256-T', '256GB - Titanium Gray', '{"color": "Titanium Gray", "storage": "256GB"}', 0, 45, TRUE),
(6, 'SS-S24U-256-D', '256GB - Titanium Black', '{"color": "Titanium Black", "storage": "256GB"}', 0, 40, TRUE),
(6, 'SS-S24U-512-T', '512GB - Titanium Gray', '{"color": "Titanium Gray", "storage": "512GB"}', 5000000, 25, TRUE);

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
(1, 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-1.jpg', 'iPhone 15 Pro Max', 0, TRUE),
(1, 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-titan-tu-nhien-2.jpg', 'iPhone 15 Pro Max back', 1, FALSE),
(2, 'https://cdn.tgdd.vn/Products/Images/42/305659/iphone-15-pro-titan-tu-nhien-1.jpg', 'iPhone 15 Pro', 0, TRUE),
(3, 'https://cdn.tgdd.vn/Products/Images/42/305660/iphone-15-xanh-1.jpg', 'iPhone 15', 0, TRUE),
(4, 'https://cdn.tgdd.vn/Products/Images/42/240259/iphone-14-trang-1.jpg', 'iPhone 14', 0, TRUE),
(5, 'https://cdn.tgdd.vn/Products/Images/42/223602/iphone-13-xanh-la-1.jpg', 'iPhone 13', 0, TRUE),
(6, 'https://cdn.tgdd.vn/Products/Images/42/319670/samsung-galaxy-s24-ultra-grey-1.jpg', 'Galaxy S24 Ultra', 0, TRUE),
(7, 'https://cdn.tgdd.vn/Products/Images/42/319665/samsung-galaxy-s24-plus-black-1.jpg', 'Galaxy S24+', 0, TRUE),
(8, 'https://cdn.tgdd.vn/Products/Images/42/319666/samsung-galaxy-s24-black-1.jpg', 'Galaxy S24', 0, TRUE),
(9, 'https://cdn.tgdd.vn/Products/Images/42/307172/samsung-galaxy-z-fold5-kem-1.jpg', 'Galaxy Z Fold5', 0, TRUE),
(10, 'https://cdn.tgdd.vn/Products/Images/42/307172/samsung-galaxy-z-fold5-den-1.jpg', 'Galaxy Z Fold5 512GB', 0, TRUE),
(11, 'https://cdn.tgdd.vn/Products/Images/42/322099/samsung-galaxy-a55-xanh-1.jpg', 'Galaxy A55', 0, TRUE),
(12, 'https://cdn.tgdd.vn/Products/Images/42/319210/xiaomi-14-trang-1.jpg', 'Xiaomi 14', 0, TRUE),
(13, 'https://cdn.tgdd.vn/Products/Images/42/319211/xiaomi-14-ultra-trang-1.jpg', 'Xiaomi 14 Ultra', 0, TRUE),
(14, 'https://cdn.tgdd.vn/Products/Images/42/314209/xiaomi-13t-xam-1.jpg', 'Xiaomi 13T Pro', 0, TRUE),
(15, 'https://cdn.tgdd.vn/Products/Images/42/320722/redmi-note-13-pro-plus-tim-1.jpg', 'Redmi Note 13 Pro+', 0, TRUE),
(16, 'https://cdn.tgdd.vn/Products/Images/42/319128/oppo-find-x7-ultra-nau-1.jpg', 'OPPO Find X7 Ultra', 0, TRUE),
(17, 'https://cdn.tgdd.vn/Products/Images/42/322222/oppo-reno12-pro-bac-1.jpg', 'OPPO Reno12 Pro', 0, TRUE),
(18, 'https://cdn.tgdd.vn/Products/Images/42/309847/oppo-a98-xanh-1.jpg', 'OPPO A98', 0, TRUE);

-- ============================================
-- ADMIN USER (password: admin123)
-- ============================================
INSERT IGNORE INTO users (id, email, password_hash, full_name, phone, role, status, email_verified_at) VALUES
(1, 'admin@phonestore.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EO', 'Administrator', '0901234567', 'ADMIN', 'ACTIVE', NOW());

SELECT 'Seed data inserted successfully!' AS result;
