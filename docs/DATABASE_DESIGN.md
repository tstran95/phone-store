# Phone Store E-commerce - Database Design Document

## 📊 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐           │
│  │   MariaDB    │      │   MongoDB    │      │    Redis     │           │
│  │  (Primary)   │◄────►│  (Document)  │◄────►│   (Cache)    │           │
│  │              │      │              │      │              │           │
│  │ ACID Data    │      │ Logs/Analytics│     │ Session/Cart │           │
│  │ 15 tables    │      │ 6 collections │     │ Hot data     │           │
│  └──────────────┘      └──────────────┘      └──────────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ MariaDB (Primary Database)

### 1. Users Module (3 tables)

#### `users` - Thông tin ngườii dùng
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| email | VARCHAR(255) UNIQUE | Email đăng nhập |
| password_hash | VARCHAR(255) | Mật khẩu (BCrypt) |
| full_name | VARCHAR(100) | Họ tên |
| phone | VARCHAR(20) | Số điện thoại |
| avatar_url | VARCHAR(500) | Ảnh đại diện |
| role | ENUM | USER/ADMIN/MANAGER |
| status | ENUM | ACTIVE/INACTIVE/SUSPENDED |
| email_verified_at | TIMESTAMP | Xác nhận email |
| last_login_at | TIMESTAMP | Lần đăng nhập cuối |

#### `user_addresses` - Địa chỉ giao hàng
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| user_id | FK users.id | Tham chiếu ngườii dùng |
| province/district/ward | VARCHAR(100) | Địa chỉ 3 cấp |
| street_address | VARCHAR(255) | Địa chỉ chi tiết |
| is_default | BOOLEAN | Địa chỉ mặc định |

#### `refresh_tokens` - JWT refresh tokens
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| user_id | FK users.id | Tham chiếu user |
| token_hash | VARCHAR(255) UNIQUE | Hash của token |
| expires_at | TIMESTAMP | Hạn sử dụng |
| device_info | VARCHAR(255) | Thông tin thiết bị |

---

### 2. Product Module (5 tables)

#### `categories` - Danh mục sản phẩm
```sql
┌─ id (PK)
├─ name: "Điện thoại"
├─ slug: "dien-thoai"
├─ parent_id (FK self) → Hỗ trợ danh mục con
├─ image_url
├─ display_order
└─ is_active
```

#### `brands` - Thương hiệu
```sql
┌─ id (PK)
├─ name: "Apple"
├─ slug: "apple"
├─ logo_url
├─ country
└─ is_active
```

#### `products` - Sản phẩm chính
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| sku | VARCHAR(50) UNIQUE | Mã sản phẩm |
| name | VARCHAR(255) | Tên sản phẩm |
| slug | VARCHAR(255) UNIQUE | URL-friendly |
| description | LONGTEXT | Mô tả chi tiết |
| category_id | FK categories.id | Danh mục |
| brand_id | FK brands.id | Thương hiệu |
| base_price | DECIMAL(15,2) | Giá gốc |
| sale_price | DECIMAL(15,2) | Giá khuyến mãi |
| status | ENUM | DRAFT/PENDING/ACTIVE/... |
| view_count | INT UNSIGNED | Lượt xem |
| sold_count | INT UNSIGNED | Đã bán |
| rating_average | DECIMAL(2,1) | Điểm TB đánh giá |

#### `product_variants` - Biến thể sản phẩm
```sql
┌─ id (PK)
├─ product_id (FK)
├─ sku: "IP15-128-BLK"
├─ variant_name: "iPhone 15 128GB Black"
├─ attributes: JSON {"color": "Black", "storage": "128GB"}
├─ price_adjustment: +2000000
├─ stock_quantity
└─ is_active
```

#### `product_images` - Hình ảnh sản phẩm
```sql
┌─ id (PK)
├─ product_id (FK)
├─ variant_id (FK nullable)
├─ image_url
├─ is_primary (ảnh chính)
└─ display_order
```

---

### 3. Inventory Module (5 tables)

#### `inventory_transactions` - Lịch sử nhập/xuất kho
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| product_id | FK products.id | Sản phẩm |
| variant_id | FK product_variants.id | Biến thể |
| transaction_type | ENUM | PURCHASE/SALE/RETURN/ADJUSTMENT/... |
| quantity | INT | Số lượng (+/-) |
| previous_stock | INT | Tồn kho trước |
| new_stock | INT | Tồn kho sau |
| reference_type | ENUM | ORDER/PURCHASE_ORDER/MANUAL |

#### `stock_alerts` - Cảnh báo tồn kho
```sql
┌─ id (PK)
├─ product_id (FK)
├─ alert_type: LOW_STOCK/OUT_OF_STOCK/OVERSTOCK
├─ current_stock
├─ is_resolved
└─ created_at
```

#### `suppliers` - Nhà cung cấp
#### `purchase_orders` - Đơn đặt hàng NCC
#### `purchase_order_items` - Chi tiết đơn đặt hàng

---

### 4. Cart Module (2 tables)

#### `carts` - Giỏ hàng (persistent)
```sql
┌─ id (PK)
├─ user_id (FK nullable)
├─ session_id (cho khách vãng lai)
├─ status: ACTIVE/CONVERTED/ABANDONED
├─ total_items
├─ subtotal
├─ coupon_code
└─ expired_at
```

**Note:** Cart chính được lưu trong Redis, bảng này là backup/persistence

#### `cart_items` - Chi tiết giỏ hàng
```sql
┌─ id (PK)
├─ cart_id (FK)
├─ product_id (FK)
├─ variant_id (FK)
├─ quantity
└─ unit_price
```

---

### 5. Order Module (3 tables)

#### `orders` - Đơn hàng
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| order_number | VARCHAR(50) UNIQUE | Mã đơn hàng: ORD-YYYYMMDD-XXXXX |
| user_id | FK users.id | Khách hàng |
| shipping_name/phone/address | | Snapshot địa chỉ |
| subtotal/shipping_fee/tax/discount/total | DECIMAL | Chi tiết giá |
| status | ENUM | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED |
| payment_method | ENUM | COD/VNPAY/MOMO/BANK_TRANSFER |
| payment_status | ENUM | PENDING/PAID/FAILED/REFUNDED |
| tracking_number | VARCHAR(100) | Mã vận đơn |

#### `order_items` - Chi tiết đơn hàng
```sql
┌─ id (PK)
├─ order_id (FK)
├─ product_id (FK)
├─ variant_id (FK)
├─ product_name (snapshot)
├─ product_sku (snapshot)
├─ quantity
└─ unit_price
```

#### `order_status_history` - Lịch sử thay đổi trạng thái
```sql
┌─ id (PK)
├─ order_id (FK)
├─ status_from → status_to
├─ changed_by (FK users.id)
├─ note
└─ created_at
```

---

### 6. Payment Module (2 tables)

#### `payments` - Giao dịch thanh toán
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| order_id | FK orders.id | Đơn hàng |
| transaction_id | VARCHAR(255) | Mã giao dịch nội bộ |
| payment_method | ENUM | COD/VNPAY/MOMO/... |
| provider | VARCHAR(50) | Nhà cung cấp |
| amount | DECIMAL(15,2) | Số tiền |
| status | ENUM | PENDING/SUCCESS/FAILED/REFUNDED |
| provider_transaction_id | VARCHAR(255) | Mã giao dịch VNPay/Momo |
| provider_response | TEXT | JSON response từ provider |

#### `payment_refunds` - Hoàn tiền
```sql
┌─ id (PK)
├─ payment_id (FK)
├─ amount
├─ reason
├─ status: PENDING/COMPLETED/FAILED
└─ processed_by (FK)
```

---

### 7. Review Module (3 tables)

#### `reviews` - Đánh giá sản phẩm
```sql
┌─ id (PK)
├─ product_id (FK)
├─ user_id (FK)
├─ order_id (FK) - verified purchase
├─ rating: 1-5
├─ title
├─ content
├─ is_verified_purchase
├─ is_approved
├─ helpful_count
└─ created_at
```

#### `review_images` - Hình ảnh đánh giá
#### `review_votes` - Vote hữu ích/không hữu ích

---

### 8. Coupon Module (3 tables)

#### `coupons` - Mã giảm giá
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED PK | ID tự tăng |
| code | VARCHAR(50) UNIQUE | Mã: TET2024, WELCOME10 |
| discount_type | ENUM | PERCENTAGE/FIXED_AMOUNT/FREE_SHIPPING |
| discount_value | DECIMAL(15,2) | Giá trị giảm |
| max_discount_amount | DECIMAL(15,2) | Giảm tối đa (cho %) |
| min_order_amount | DECIMAL(15,2) | Đơn hàng tối thiểu |
| max_uses | INT | Số lần sử dụng tối đa |
| max_uses_per_user | INT | Mỗi user được dùng bao nhiêu lần |
| starts_at/expires_at | TIMESTAMP | Thời hạn |

#### `coupon_restrictions` - Giới hạn áp dụng
#### `coupon_usages` - Lịch sử sử dụng

---

### 9. Wishlist Module (1 table)

#### `wishlists`
```sql
┌─ id (PK)
├─ user_id (FK)
├─ product_id (FK)
├─ variant_id (FK)
├─ notify_when_available
└─ added_at
```

### 10. Notification Module (1 table)

#### `notifications`
```sql
┌─ id (PK)
├─ user_id (FK)
├─ type: ORDER/PROMOTION/SYSTEM
├─ title
├─ content
├─ action_url
├─ is_read
└─ created_at
```

---

## 🍃 MongoDB (Document Store)

### Collections

#### 1. `product_specs` - Thông số kỹ thuật động
```javascript
{
  _id: ObjectId,
  product_id: NumberLong(123),
  product_name: "iPhone 15 Pro Max",
  specifications: {
    display: "6.7 inch Super Retina XDR",
    processor: "A17 Pro",
    ram: "8GB",
    storage: "256GB/512GB/1TB",
    battery: "4422 mAh",
    os: "iOS 17",
    camera: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
    weight: "221g",
    dimensions: "159.9 x 76.7 x 8.25 mm",
    wifi: "Wi-Fi 6E",
    bluetooth: "5.3",
    nfc: true,
    extras: {
      water_resistant: "IP68",
      face_id: true,
      wireless_charging: "MagSafe 15W"
    }
  },
  highlights: [
    "Titanium design",
    "Action Button",
    "USB-C connector"
  ],
  in_the_box: [
    "iPhone 15 Pro Max",
    "USB-C Charge Cable",
    "Documentation"
  ],
  created_at: ISODate(),
  updated_at: ISODate()
}
```
**Indexes:**
- `product_id`: unique
- Text index on `product_name`, `specifications.processor`

---

#### 2. `user_activity_logs` - Log hoạt động ngườii dùng
```javascript
{
  _id: ObjectId,
  user_id: NumberLong(456),
  session_id: "sess_abc123xyz",
  activity_type: "VIEW_PRODUCT", // LOGIN, ADD_TO_CART, SEARCH, PURCHASE...
  details: {
    product_id: NumberLong(123),
    product_name: "iPhone 15 Pro Max",
    search_query: "iphone 15",
    cart_item_count: 3,
    order_id: NumberLong(789),
    amount: 34990000,
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0...",
    referrer: "https://google.com"
  },
  timestamp: ISODate(),
  metadata: {}
}
```
**Indexes:**
- `user_id + timestamp` (desc)
- `activity_type + timestamp`
- `timestamp` (TTL: 1 year)

---

#### 3. `search_analytics` - Phân tích tìm kiếm
```javascript
{
  _id: ObjectId,
  user_id: NumberLong(456), // null for anonymous
  session_id: "sess_abc123xyz",
  query: "iphone 15 pro max",
  filters: {
    category: "dien-thoai",
    brand: "apple",
    price_min: 30000000,
    price_max: 40000000,
    rating: 4
  },
  results_count: 15,
  clicked_product_ids: [123, 124, 125],
  converted: true, // Đã mua không?
  response_time_ms: 45,
  timestamp: ISODate()
}
```

---

#### 4. `audit_trail` - Audit log thay đổi
```javascript
{
  _id: ObjectId,
  entity_type: "ORDER", // USER, PRODUCT, PAYMENT...
  entity_id: NumberLong(789),
  action: "STATUS_CHANGE", // CREATE, UPDATE, DELETE...
  performed_by: NumberLong(1), // Admin ID
  performed_by_email: "admin@phonestore.com",
  changes: {
    field_name: "status",
    old_value: "PENDING",
    new_value: "CONFIRMED"
  },
  reason: "Customer called to confirm",
  ip_address: "203.0.113.42",
  timestamp: ISODate()
}
```
**TTL:** 3 years

---

#### 5. `notification_queue` - Queue thông báo
```javascript
{
  _id: ObjectId,
  type: "EMAIL", // SMS, PUSH
  recipient: "customer@email.com",
  subject: "Đơn hàng #ORD-20240115-001 đã được xác nhận",
  content: "<html>...</html>",
  template_data: {
    order_number: "ORD-20240115-001",
    customer_name: "Nguyễn Văn A",
    total_amount: 34990000
  },
  status: "PENDING", // PROCESSING, SENT, FAILED
  priority: 1, // 1=High, 2=Normal, 3=Low
  retry_count: 0,
  error_message: null,
  created_at: ISODate(),
  scheduled_at: ISODate(),
  sent_at: null
}
```

---

#### 6. `product_review_summary` - Tổng hợp đánh giá (materialized)
```javascript
{
  _id: ObjectId,
  product_id: NumberLong(123),
  total_reviews: 152,
  average_rating: 4.5,
  rating_distribution: {
    "5": 89,
    "4": 42,
    "3": 15,
    "2": 4,
    "1": 2
  },
  recent_reviews: [
    {
      user_name: "Nguyễn Văn A",
      rating: 5,
      comment: "Sản phẩm rất tốt!",
      created_at: ISODate()
    }
    // ... 5 recent reviews
  ],
  last_updated: ISODate()
}
```

---

## ⚡ Redis (Cache & Session)

### Key Patterns

```
# Session
session:{token} → Hash { user_id, role, exp }
TTL: 24 hours

# Cart (primary storage)
cart:{user_id} → Hash {
    items: JSON [
        {product_id, variant_id, quantity, unit_price, added_at}
    ],
    coupon_code,
    subtotal,
    updated_at
}
TTL: 30 days (or persistent for logged-in)

cart:session:{session_id} → (same structure)
TTL: 7 days

# Hot Products (sorted by view count)
product:hot → Sorted Set { product_id: score(view_count) }
Top 100, TTL: 1 hour

# Product View Count (real-time)
product:views:{product_id} → String (counter)
Sync to MariaDB every 10 minutes

# Rate Limiting
rate_limit:api:{ip} → String (count)
TTL: 1 minute

rate_limit:login:{ip} → String (count)
TTL: 15 minutes

# Cache
product:{product_id} → JSON (product detail)
TTL: 10 minutes

category:list → JSON (all active categories)
TTL: 1 hour

# Distributed Lock
lock:inventory:{product_id} → String
TTL: 10 seconds

# User sessions
user:sessions:{user_id} → Set [token1, token2, ...]
```

---

## 🔄 Data Flow Diagrams

### 1. User Registration Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  Client │────►│   Backend   │────►│ MariaDB  │
│         │     │   (Java)    │     │  users   │
└─────────┘     └─────────────┘     └──────────┘
     │                │
     │                └────► Hash password (BCrypt)
     │                └────► Insert user record
     │                └────► Send welcome email
     │                       (MongoDB notification_queue)
     ▼
┌─────────┐
│  Email  │
│ Service │
└─────────┘
```

---

### 2. Product View Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  Client │────►│   Backend   │────►│  Redis   │
│         │     │   (Java)    │     │  Cache   │
└─────────┘     └─────────────┘     └──────────┘
                      │  Miss
                      ▼
               ┌────────────┐
               │  MariaDB   │
               │  products  │
               └────────────┘
                      │
                      ▼
               ┌────────────┐
               │  MongoDB   │
               │product_specs│
               └────────────┘
                      │
                      ▼
               ┌────────────┐
               │   Redis    │ (Cache result)
               └────────────┘
                      │
                      ▼
               ┌────────────┐
               │  MongoDB   │ (Log activity)
               │activity_logs│
               └────────────┘
```

---

### 3. Add to Cart Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────┐
│  Client │────►│   Backend   │────►│  Redis   │
│         │     │   (Java)    │     │  cart:*  │
└─────────┘     └─────────────┘     └──────────┘
                      │
                      ├────► Check stock (MariaDB)
                      ├────► Update cart in Redis
                      ├────► Sync to MariaDB (cart, cart_items)
                      │
                      └────► MongoDB: log ADD_TO_CART
```

**Redis Cart Structure:**
```
HSET cart:123
  items: "[{product_id: 1, variant_id: 2, qty: 2, ...}]"
  subtotal: "69980000"
  updated_at: "2024-01-15T10:30:00Z"
```

---

### 4. Checkout Flow

```
┌─────────┐     ┌─────────────┐     ┌────────────────────────────┐
│  Client │────►│   Backend   │────►│        ACID Transaction     │
│         │     │   (Java)    │     │   (MariaDB + @Transactional)│
└─────────┘     └─────────────┘     └────────────────────────────┘
                                            │
    ┌───────────────────────────────────────┼───────────────────────┐
    │                                       │                       │
    ▼                                       ▼                       ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  orders  │  │order_items│  │ payments │  │inventory │  │  carts   │
│  INSERT  │  │ INSERT   │  │  INSERT  │  │ UPDATE   │  │  UPDATE  │
│          │  │          │  │          │  │ (stock)  │  │ CONVERTED│
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
    │                                       │
    └───────────────────────────────────────┘
                    │
                    ▼
            ┌────────────┐
            │  MongoDB   │ (audit_trail, notification_queue)
            └────────────┘
                    │
                    ▼
            ┌────────────┐
            │  VNPay/    │
            │   Momo     │
            └────────────┘
```

---

### 5. Payment Webhook Flow

```
┌───────────┐     ┌─────────────┐     ┌──────────┐
│  VNPay    │────►│   Webhook   │────►│  Redis   │
│  Momo     │     │   Handler   │     │   Lock   │
└───────────┘     └─────────────┘     └──────────┘
                        │
                        ├────► Verify signature
                        ├────► Acquire distributed lock
                        ▼
                 ┌────────────┐
                 │  MariaDB   │
                 │  payments  │
                 │  UPDATE    │
                 │  orders    │
                 └────────────┘
                        │
                        ▼
                 ┌────────────┐
                 │  MongoDB   │
                 │ audit_trail│
                 │ notification_queue
                 └────────────┘
                        │
                        ▼
                 ┌────────────┐
                 │  Email/SMS │
                 └────────────┘
```

---

### 6. Inventory Update Flow

```
User Order          Supplier PO         Manual Adjustment
     │                   │                     │
     ▼                   ▼                     ▼
┌─────────┐        ┌─────────┐          ┌─────────┐
│  SALE   │        │ PURCHASE│          │ADJUST   │
│  (minus)│        │ (plus)  │          │(any)    │
└────┬────┘        └────┬────┘          └────┬────┘
     │                   │                     │
     └───────────────────┼─────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │ inventory_transactions
              │    (INSERT log)  │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ products│  │variants │  │ stock_  │
    │.sold_count│  │.stock   │  │ alerts  │
    │ UPDATE  │  │ UPDATE  │  │ INSERT  │
    └─────────┘  └─────────┘  └─────────┘
```

---

## 📈 ER Diagram (MariaDB)

```
┌────────────────────────────────────────────────────────────────────┐
│                           users                                    │
├────────────────────────────────────────────────────────────────────┤
│ id, email, password, full_name, role, status, ...                  │
└──────┬─────────────────────┬─────────────────┬─────────────────────┘
       │                     │                 │
       │         ┌───────────┘                 │
       │         │                             │
       ▼         ▼                             ▼
┌──────────┐ ┌─────────────┐          ┌──────────────┐
│  orders  │ │ refresh_    │          │user_addresses│
│          │ │   tokens    │          │              │
│ user_id  │ │             │          │   user_id    │
└────┬─────┘ │   user_id   │          └──────────────┘
     │       └─────────────┘
     │
     │    ┌─────────────┐
     ├───►│order_items  │
     │    │             │
     │    │  order_id   │
     │    └──────┬──────┘
     │           │
     │    ┌──────┴──────┐
     │    ▼             ▼
     │ ┌──────────┐ ┌───────────────┐
     │ │ products │ │product_variants│
     │ │          │ │               │
     │ │   id     │ │   product_id  │
     │ └────┬─────┘ └───────────────┘
     │      │
     │      │         ┌─────────────┐
     │      ├────────►│   brands    │
     │      │         └─────────────┘
     │      │
     │      │         ┌─────────────┐
     │      └────────►│  categories │
     │                └─────────────┘
     │
     └────────►┌──────────┐
               │ payments │
               │          │
               │ order_id │
               └──────────┘
```

---

## 🚀 Triển khai

### 1. Khởi động Docker
```bash
cd /Users/tstran95/ALL_IN_ONE/IT/PROJECT/phone-store
docker-compose up -d
```

### 2. Kiểm tra services
```bash
# MariaDB
docker-compose exec mariadb mysql -u phonestore -p phonestore_db

# MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Redis
docker-compose exec redis redis-cli ping
```

### 3. Admin UI
- **MongoDB Express**: http://localhost:8081
- **phpMyAdmin**: http://localhost:8082

---

## 📋 Tổng kết

| Component | Số lượng | Mục đích |
|-----------|----------|----------|
| MariaDB | 15 tables | ACID data: users, products, orders, payments |
| MongoDB | 6 collections | Logs, analytics, dynamic data, queue |
| Redis | ~10 key patterns | Session, cart, cache, rate limiting |

### Các nguyên tắc thiết kế:
1. **MariaDB**: Dữ liệu cần ACID, quan hệ phức tạp, transactions
2. **MongoDB**: Dữ liệu schema-flexible, high-write (logs), analytics
3. **Redis**: Hot data, cache, real-time counters, sessions
