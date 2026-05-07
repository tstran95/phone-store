# AGENTS.md - AI Agent Guide for Phone Store E-Commerce

This guide helps AI coding agents understand the architecture and patterns needed to be productive in this codebase.

## Architecture Overview

**Phone Store** is a full-stack e-commerce platform with:
- **Backend**: Java Spring Boot 3.2 (JPA, Security, Redis)
- **Frontend**: React 18 + Vite with Zustand state management
- **Databases**: MariaDB (ACID transactions), MongoDB (logs/audit), Redis (cache/cart)

### Data Flow
```
Client → Frontend (React) → [axios + JWT interceptor] → Backend API (/api/v1)
         ↓ State: Zustand                                    ↓ Service layer
         [authStore, cartStore]                          ↓ Repository pattern
                                                    [MariaDB/MongoDB/Redis]
```

### Why This Structure?
- **Tri-layer Backend** (Controller→Service→Repository): SOLID principles, testable
- **Multi-DB Strategy**: MariaDB for transactions (orders), MongoDB for flexible logs, Redis for fast cache
- **Zustand** not Context API: Simpler state + built-in persistence (localStorage)
- **API Interceptors**: Centralized JWT refresh and error handling

---

## Critical Workflows

### 1. Local Development Setup
```bash
# Start infrastructure (databases, caches, admin UIs)
docker-compose up -d

# Backend (Java) - runs on 8080
cd backend
mvn clean compile                    # Compile only
mvn spring-boot:run                  # Dev server
mvn test                             # Run all tests
mvn test -Dtest=AuthServiceTest      # Single test class

# Frontend (React) - runs on 3000
cd frontend
npm install                          # One-time setup
npm run dev                          # Dev server with hot reload
npm run build                        # Production bundle
```

**Access URLs**:
- Frontend: http://localhost:3000
- API Swagger: http://localhost:8080/api/swagger-ui.html
- phpMyAdmin: http://localhost:8082 (root/root123)
- Mongo Express: http://localhost:8081 (admin/admin123)

### 2. Database Schema Operations
```bash
# MariaDB seed data already loaded via docker-compose init script
# Accessible: phonestore/phonestore123 on phonestore_db
# Collections auto-created by Spring Data MongoDB

# Key tables: users, products, orders, payments, inventory, wishlists
# Key MongoDB collections: user_activity_logs, audit_trail, product_specs
```

### 3. Adding New API Endpoint
Pattern: Controller → Request/Response DTOs → Service → Repository

```java
// 1. Create DTOs (backend/src/main/java/com/phonestore/dto/)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateReviewRequest {
    @NotBlank private String comment;
    @Min(1) @Max(5) private int rating;
}

// 2. Create controller endpoint (backend/src/main/java/com/phonestore/controller/)
@PostMapping("/{productId}/reviews")
public ResponseEntity<ApiResponse<ReviewResponse>> create(
    @PathVariable Long productId,
    @Valid @RequestBody CreateReviewRequest request
) {
    ReviewResponse data = reviewService.create(productId, request);
    return ResponseEntity.ok(ApiResponse.success("Review created", data));
}

// 3. Update service with business logic (backend/src/main/java/com/phonestore/service/)
@Service
public class ReviewService {
    public ReviewResponse create(Long productId, CreateReviewRequest request) {
        // validation, DB operations, return DTO
    }
}

// 4. Frontend call via utils/api.js pattern
export const reviewApi = {
    create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
}
```

---

## Project-Specific Conventions

### Backend Patterns

**1. Response Wrapper Pattern** (ALL responses must use this)
```java
// All controller methods return ApiResponse<T>
ApiResponse.success("message", data)          // 200 with data
ApiResponse.error("error message")             // Automatic error code
// Response: { success: true/false, message: "...", data: {...}, errors: [...] }
```

**2. DTO vs Entity** (No wildcard imports - explicit only)
```java
// DTOs in separate request/response folders for clarity
com.phonestore.dto.request.*     // Input validation (JSR-380 annotations)
com.phonestore.dto.response.*    // Output formatting
com.phonestore.entity.*          // JPA entities (Lombok @Data)
```

**3. MapStruct Mappers** (Preferred over manual mapping)
```java
@Mapper(componentModel = "spring")
public interface ReviewMapper {
    ReviewResponse toResponse(Review entity);
    Review toEntity(CreateReviewRequest request);
}
// Inject: @Autowired ReviewMapper mapper;
```

**4. Service Layer** (Business logic, DB queries, external calls)
```java
@Service
@Transactional       // For queries, use @Transactional(readOnly = true)
public class OrderService {
    public OrderResponse create(CheckoutRequest request) {
        // Validate inventory, compute totals, save to DB, send email
    }
}
```

**5. Testing Pattern** (JUnit 5 + Mockito)
```java
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
    @Mock private ReviewRepository reviewRepository;
    @InjectMocks private ReviewService service;
    
    @Test
    void shouldCreateReview() { /* ... */ }
}
```

### Frontend Patterns

**1. Zustand Store** (for Auth & Cart - with persistence)
```javascript
// frontend/src/stores/authStore.js structure
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken, isAuthenticated: true }),
      logout: () => set(initialState),
      getToken: () => get().token,
    }),
    { name: 'auth-storage' }  // localStorage key
  )
)
```

**2. API Client** (utils/api.js - handles JWT refresh automatically)
```javascript
// Request interceptor adds JWT token
// Response interceptor:
//   - 401 status triggers token refresh automatically
//   - Errors get toast notifications (except auth endpoints)
//   - Unwraps response.data automatically

// Usage:
const { data } = await productApi.getAll({ page: 0, size: 20 })
```

**3. Component Pattern** (Functional + Hooks)
```javascript
import { useAuthStore } from '../stores/authStore'
import { productApi } from '../utils/api'

export function ProductList() {
  const { isAuthenticated } = useAuthStore()
  const [products, setProducts] = useState([])
  
  useEffect(() => {
    productApi.getAll({ page: 0 }).then(data => setProducts(data.productList))
  }, [])
  
  return <div>...</div>
}
```

**4. TailwindCSS Classes** (No inline styles - use utility classes)
```jsx
<div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
  <h2 className="text-lg font-semibold text-gray-800">Products</h2>
</div>
```

---

## Integration Points & External Dependencies

### VNPay Payment Integration
- **Controller**: `VNPayController` handles payment URL creation and callback
- **Service**: `VNPayService` verifies HMAC signature, updates order status, sends emails
- **Flow**: Order created → GET `/payments/create/{orderNumber}` → redirect to VNPay → IPN callback → POST `/payments/ipn`
- **Key**: Signature verification is critical for security

### JWT Authentication
- **Filter**: `JwtAuthenticationFilter` validates token on every secured request
- **Refresh**: Frontend axios interceptor auto-refreshes 401 responses
- **Token Structure**: Access (short-lived) + Refresh (long-lived) tokens
- **Storage**: Frontend stores both in localStorage via Zustand

### Redis Cart Operations
- **CartService** stores cart in Redis with key `cart:{userId}:` or `cart:{sessionId}:`
- **TTL**: User carts (30 days), guest carts (7 days)
- **Structure**: JSON serialization of CartData object

### Email Notifications
- **Service**: `EmailService` with async `@Async` methods
- **Templates**: Thymeleaf templates in `src/main/resources/templates/`
- **Usage**: Send order confirmation, password reset, notifications
- **Configuration**: application.yml with SMTP settings

### MongoDB Audit Trail
- **Document**: `AuditLog` stores all mutations (user, action, entity, timestamp)
- **Usage**: NOT for live queries, only analytics/compliance
- **Pattern**: Service logs to MongoDB after MariaDB transaction succeeds

---

## Known Challenges & Workarounds

### Lombok @Builder Issue
- **Problem**: Compile errors with @Builder annotation
- **Current**: Use factory methods instead or Lombok @Data + manual setters
- **Example**: `User user = new User(); user.setName("x");` (not `User.builder().name("x").build()`)

### Cart Guest-to-User Merge
- **Problem**: Guest adds items, then logs in
- **Solution**: `cartApi.merge(guestCartId)` endpoint combines carts
- **Called in**: Login component after successful authentication

### VNPay Sandbox vs Production
- **Sandbox**: TMN_CODE/HASH_SECRET from VNPay test account
- **Production**: Requires approved credentials - see application.yml notes

---

## File Locations for Common Tasks

| Task | Primary Files |
|------|---|
| Add new API endpoint | `controller/` → `dto/request,response/` → `service/` → `repository/` |
| Modify product listing | `ProductService.java` → `ProductRepository.java` → `ProductController.java` |
| Change cart logic | `CartService.java` (Redis operations) + `CartController.java` |
| Add form validation | DTOs with `@NotBlank`, `@Email`, `@Min` annotations (JSR-380) |
| Style a page | Component's CSS classes (TailwindCSS utilities) |
| Fix a failing test | `backend/src/test/` - same path structure as source |
| Add admin feature | `AdminController.java` + frontend `pages/admin/` + role check in `SecurityConfig` |
| Debug payment issues | `VNPayService.java` (IPN verification) + `OrderService.java` (status updates) |

---

## Essential Commands Quick Reference

```bash
# Backend
mvn clean install                   # Full rebuild (Maven dependencies)
mvn compile                         # Just compile (no tests)
mvn spring-boot:run                 # Start dev server
mvn test                            # Run all tests
mvn package -DskipTests             # Build JAR for deployment

# Frontend
npm install                         # Install deps (run after package.json changes)
npm run dev                         # Dev server with HMR
npm run build                       # Production bundle to dist/
npm run preview                     # Serve production build locally

# Docker Infrastructure
docker-compose up -d                # Start all services background
docker-compose down                 # Stop all services
docker-compose logs -f              # Follow logs (Ctrl+C to exit)
docker-compose exec mariadb mysql -u root -p       # Access MariaDB shell
```

---

## Debugging Checklist

When something breaks:

1. **Backend Won't Start**: Check logs in `backend/logs/` - common: port 8080 in use, DB not ready
2. **API 401 Errors**: JWT token expired or invalid - check `JwtAuthenticationFilter`
3. **Frontend Blank Page**: Check browser console (F12) + network errors - likely API call failure
4. **Cart Not Persisting**: Redis connection issue - verify `RedisConfig.java` and docker-compose
5. **Payment Fails**: Check VNPay signature verification in `VNPayService.verifyIpn()`
6. **Email Not Sending**: Verify SMTP settings in `application.yml` - check logs for exceptions

---

## Code Quality Standards

- **No wildcard imports** - All `import com.phonestore.*;` → explicit `import com.phonestore.entity.User;`
- **Explicit error messages** - Use specific exception messages for debugging
- **Validation first** - DTOs validate before reaching service layer
- **Transaction boundaries** - `@Transactional` on service methods that modify multiple entities
- **Test coverage** - Add unit tests for new business logic (services + edge cases)
- **API documentation** - Use `@Operation`, `@Parameter` annotations in controllers (for Swagger)

---

## Next Steps for Adding Features

1. **Design**: Identify DB entities (new table/collection needed?)
2. **Backend**: Entity → Repository → Service → DTO → Controller
3. **Testing**: Write tests for service layer
4. **Frontend**: API client method → Zustand store (if needed) → Component → UI
5. **Integration**: Test full flow locally, check edge cases
6. **Documentation**: Update Swagger annotations if new public API

---

**Generated**: May 7, 2026
**Last Updated**: Phase 1 Complete - Full e-commerce platform operational
**Key Contacts**: See FINAL_SUMMARY.md for feature list and CLAUDE.md for detailed conventions

