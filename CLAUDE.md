# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phone Store E-commerce - Full Stack Application with Java Spring Boot backend and React frontend.

## Tech Stack

### Backend
- Java 17+, Spring Boot 3.2
- MariaDB (primary), MongoDB (logs), Redis (cache/cart)
- Maven build, Lombok, MapStruct

### Frontend
- React 18, Vite, TailwindCSS
- Axios, React Query, Zustand, React Router

## Common Commands

### Infrastructure (Docker)
```bash
docker-compose up -d          # Start MariaDB, MongoDB, Redis, Admin UIs
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

### Backend (Maven)
```bash
cd backend
mvn clean compile             # Compile only
mvn spring-boot:run           # Run dev server (port 8080)
mvn test                      # Run all tests
mvn test -Dtest=AuthServiceTest  # Run single test class
mvn clean package -DskipTests # Build JAR
```

### Frontend (npm)
```bash
cd frontend
npm install                   # Install dependencies
npm run dev                   # Dev server (port 3000)
npm run build                 # Production build
npm run preview               # Preview production build
```

### Access URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html
- phpMyAdmin: http://localhost:8082 (root/root123)
- Mongo Express: http://localhost:8081 (admin/admin123)

## Architecture

### Backend Structure
```
backend/src/main/java/com/phonestore/
├── config/           # SecurityConfig, RedisConfig, VNPayConfig
├── controller/       # REST endpoints (v1/...)
├── service/          # Business logic layer
├── repository/       # JPA repositories
├── entity/           # MariaDB JPA entities
├── document/         # MongoDB documents
├── dto/              # Request/Response DTOs
├── mapper/           # MapStruct mappers
├── security/         # JWT filter, service
└── exception/        # Global exception handler
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── layout/       # Header, Footer, Layout
│   └── common/       # ProductCard, LoadingSkeleton
├── pages/            # Page components (Home, Cart, etc.)
├── stores/           # Zustand stores (authStore, cartStore)
├── utils/            # api.js, format.js
└── hooks/            # Custom React hooks
```

### Database Design
- **MariaDB**: Users, Products, Orders, Payments (ACID transactions)
- **MongoDB**: Logs, Analytics, Product specs (flexible schema)
- **Redis**: Session, Cart (TTL: 30 days user, 7 days guest)

## Key Conventions

### Code Style
- **No wildcard imports** - All imports must be explicit
- Lombok @Data for DTOs/Entities (note: @Builder has compile issues)
- Response wrapped in ApiResponse<T> with success/data/error pattern

### API Conventions
- Base path: `/api/v1`
- RESTful endpoints: `/products`, `/orders`, `/auth/login`
- JWT token in Authorization header: `Bearer <token>`

### Frontend Patterns
- API calls via `utils/api.js` with axios interceptors
- State management with Zustand (auth, cart persisted)
- Toast notifications via react-hot-toast
- Price format: `new Intl.NumberFormat('vi-VN')`

## Known Issues

### Backend
- Lombok @Builder annotation processing failing - compile errors with `builder()` method
- Workaround: Use factory methods instead of @Builder, or fix Maven annotation processor config

### Environment Variables
Backend (`backend/src/main/resources/application.yml`):
```yaml
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
REDIS_HOST, REDIS_PORT
JWT_SECRET
VNPAY_TMN_CODE, VNPAY_HASH_SECRET
```

Frontend (`frontend/.env`):
```
VITE_API_URL=http://localhost:8080/api/v1
```

## Default Credentials
- **MariaDB**: root/root123, phonestore/phonestore123
- **MongoDB**: admin/admin123
- **Admin User**: admin@phonestore.com / admin123

## Improvements Needed

### Phase 1 - Critical (Fix First)
| Priority | Issue | Action |
|----------|-------|--------|
| P0 | Lombok @Builder compile errors | Fix Maven annotation processor or replace with factory methods |
| P0 | VNPay IPN callback handler | Implement payment return URL handling |
| P1 | Backend build failing | Fix DTO/Entity getter/setter generation |

### Phase 2 - Features to Add
| Priority | Feature | Location |
|----------|---------|----------|
| P1 | Wishlist API | `POST /api/v1/wishlists`, `GET /api/v1/wishlists` |
| P1 | Product Reviews | `POST /api/v1/products/{id}/reviews` |
| P1 | Search full-text | Elasticsearch or MariaDB FULLTEXT index |
| P1 | Real-time notifications | WebSocket/SSE for order status updates |
| P2 | Admin Dashboard | React Admin or separate admin SPA |
| P2 | Analytics dashboard | Revenue stats, best-selling products |
| P2 | Multi-language i18n | React i18next integration |
| P2 | Product comparison | Compare specs side-by-side |
| P3 | Chat support | WebSocket chat or Chatbot integration |
| P3 | Loyalty points | Points system for purchases |

### Technical Debt
- Replace `@Builder` with static factory methods in DTOs
- Add integration tests for payment flow
- Implement proper audit logging (MongoDB)
- Add rate limiting for auth endpoints
- Configure CORS for production domains
- Setup log aggregation (ELK/Loki)
- Add Prometheus metrics
