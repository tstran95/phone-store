# 📱 Phone Store E-commerce

Website bán điện thoại và thiết bị công nghệ - Full Stack Application

## 🎯 Tech Stack

### Backend
- **Java 17+** - Ngôn ngữ chính
- **Spring Boot 3.x** - Framework
  - Spring Web (REST API)
  - Spring Data JPA
  - Spring Security (JWT)
  - Spring Validation
  - Spring Cache (Redis)
- **Maven** - Build tool
- **Lombok** - Boilerplate reduction
- **MapStruct** - Object mapping

### Databases
- **MariaDB 10.6** - Primary database (ACID transactions)
- **MongoDB 6.0** - Document store (logs, analytics, specs)
- **Redis 7** - Cache, session, cart, rate limiting

### Frontend
- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **React Query** - Data fetching
- **React Router** - Routing

---

## 📁 Project Structure

```
phone-store/
├── backend/
│   ├── src/main/java/com/phonestore/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST Controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access layer
│   │   ├── entity/          # JPA Entities (MariaDB)
│   │   ├── document/        # MongoDB Documents
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── mapper/          # MapStruct mappers
│   │   ├── security/        # JWT, Security config
│   │   └── exception/       # Exception handlers
│   └── src/main/resources/
│       ├── application.yml
│       └── application-dev.yml
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context
│   │   └── utils/           # Utilities
│   └── package.json
├── db/                      # Database scripts
│   ├── init-mariadb.sql      # MariaDB schema + seed
│   ├── mongo-init.js         # MongoDB collections
│   └── redis.conf            # Redis configuration
├── docs/                    # Documentation
│   └── DATABASE_DESIGN.md    # Chi tiết thiết kế DB
└── docker-compose.yml       # Infrastructure
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+
- Maven 3.8+

### 1. Khởi động Infrastructure

```bash
cd phone-store
docker-compose up -d
```

**Services sẽ chạy:**
| Service | Port | Description |
|---------|------|-------------|
| MariaDB | 3306 | Primary database |
| MongoDB | 27017 | Document store |
| Redis | 6379 | Cache |
| Mongo Express | 8081 | MongoDB UI (admin/admin123) |
| phpMyAdmin | 8082 | MariaDB UI (root/root123) |

### 2. Kiểm tra databases

```bash
# Test MariaDB
docker-compose exec mariadb mysql -u phonestore -p phonestore_db
# Password: phonestore123

# Test MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Test Redis
docker-compose exec redis redis-cli ping
# Expected: PONG
```

### 3. Chạy Backend (coming soon)

```bash
cd backend
mvn spring-boot:run
```

### 4. Chạy Frontend (coming soon)

```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Database Schema

### MariaDB (15 tables)
- `users`, `user_addresses`, `refresh_tokens`
- `categories`, `brands`, `products`, `product_variants`, `product_images`
- `inventory_transactions`, `stock_alerts`, `suppliers`, `purchase_orders`
- `carts`, `cart_items`
- `orders`, `order_items`, `order_status_history`
- `payments`, `payment_refunds`
- `reviews`, `review_images`, `review_votes`
- `coupons`, `coupon_restrictions`, `coupon_usages`
- `wishlists`
- `notifications`

### MongoDB (6 collections)
- `product_specs` - Thông số kỹ thuật động
- `user_activity_logs` - Log hoạt động
- `search_analytics` - Phân tích tìm kiếm
- `audit_trail` - Audit log
- `notification_queue` - Queue thông báo
- `product_review_summary` - Tổng hợp đánh giá

Chi tiết xem tại: [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md)

---

## 🔐 Default Credentials

### MariaDB
- **Root**: root / root123
- **App**: phonestore / phonestore123
- **Database**: phonestore_db

### MongoDB
- **Admin**: admin / admin123
- **App DB**: phonestore_logs

### Application Users (seed data)
- **Admin**: admin@phonestore.com / admin123

---

## 📖 API Documentation

Sau khi backend chạy, truy cập:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI Spec: http://localhost:8080/v3/api-docs

---

## 📝 Module Status

| Module | Status | Priority |
|--------|--------|----------|
| ✅ Docker + DB Setup | Hoàn thành | P0 |
| 🔲 Backend Structure | Chờ | P0 |
| 🔲 Entity + Repository | Chờ | P0 |
| 🔲 JWT Security | Chờ | P0 |
| 🔲 User API | Chờ | P1 |
| 🔲 Product API | Chờ | P1 |
| 🔲 Cart API (Redis) | Chờ | P1 |
| 🔲 Order API | Chờ | P1 |
| 🔲 Payment Integration | Chờ | P2 |
| 🔲 Frontend React | Chờ | P2 |

---

## 👨‍💻 Development Team

Built with ❤️ by Claude Code
