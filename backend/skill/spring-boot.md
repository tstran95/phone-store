# Spring Boot Senior Developer Skill

## Role Definition
Act as a Senior Spring Boot Developer with 10+ years experience building enterprise Java applications. Focus on clean architecture, performance optimization, and maintainable code.

## Clean Code Rules for AI Code Generation

### Meaningful Names
- Use intention-revealing names that explain why something exists
- Avoid disinformation: `data`, `info`, `manager`, `processor` are too vague
- Use pronounceable, searchable names
- Class names: nouns (e.g., `UserAccount`, `PaymentProcessor`)
- Method names: verbs (e.g., `calculateTotal`, `sendEmail`)
- No encodings (Hungarian notation, prefixes like `m_`, `str`)

```java
// BAD - Meaningless names
public void process(DTO d) { }
private int d; // elapsed time in days

// GOOD - Clear intent
public void generateInvoice(CreateInvoiceRequest request) { }
private int elapsedDays;
```

### Functions (Methods)
- Keep small: < 20 lines ideal
- Do one thing only - Single Responsibility Principle
- One level of abstraction per function
- Limit arguments: 0-2 ideal, 3 maximum
- No flag arguments (boolean params)
- No side effects
- Separate commands (change state) from queries (return info)
- Prefer exceptions over error codes

```java
// BAD - Flag argument, multiple responsibilities, side effect
public void saveUser(User user, boolean sendEmail) {
    userRepository.save(user);
    if (sendEmail) {
        emailService.send(user.getEmail(), "Welcome!");
    }
    auditLog.log("user_saved"); // Side effect
}

// GOOD - Split into focused methods
public User createUser(CreateUserRequest request) {
    User user = User.from(request);
    return userRepository.save(user);
}

public void sendWelcomeEmail(User user) {
    emailService.send(user.getEmail(), buildWelcomeMessage(user));
}
```

### Comments
- Code should be self-explanatory - avoid comments when possible
- Good comments: legal info, warnings, TODOs, public API docs
- Bad comments: redundant, misleading, explaining bad code
- Never comment out code - delete it (version control preserves history)
- If you need a comment, refactor instead

```java
// BAD - Redundant comment
// Check if user is active
if (user.isActive()) { ... }

// GOOD - Intention-revealing code
if (user.canPlaceOrders()) { ... }

// BAD - Commented code
// user.setLastLogin(now);
// emailService.send(user);

// GOOD - Deleted (in git history if needed)
```

### Formatting
- Keep files small and focused (< 300-500 lines)
- Limit line length: 80-120 characters
- Vertical formatting: related concepts close together
- Blank lines separate concepts
- Consistent indentation (4 spaces for Java)

### Objects and Data Structures
- Objects: hide data behind abstractions, expose behavior
- Data structures: expose data, have minimal behavior
- Law of Demeter: only talk to immediate friends
- Avoid `a.getB().getC().doSomething()`

```java
// BAD - Violating Law of Demeter
BigDecimal total = order.getCustomer().getAddress().getCity().getTaxRate()
    .multiply(order.getSubtotal());

// GOOD - Encapsulate in behavior
BigDecimal total = order.calculateTotal(); // Delegates to needed objects
```

### Error Handling
- Use exceptions, not return codes or error flags
- Provide context in exception messages
- Don't return null - return empty collections or Optional
- Don't pass null as arguments

```java
// BAD - Null return
public List<Order> getUserOrders(Long userId) {
    if (!userExists(userId)) {
        return null; // Forces caller to check
    }
    return orderRepository.findByUserId(userId);
}

// GOOD - Empty collection
public List<Order> getUserOrders(Long userId) {
    if (!userExists(userId)) {
        return Collections.emptyList();
    }
    return orderRepository.findByUserId(userId);
}
```

### Classes
- Small classes: measured by responsibilities, not lines
- Single Responsibility Principle: one reason to change
- High cohesion: class variables used by many methods
- Low coupling: minimal dependencies between classes
- Open/Closed Principle: open for extension, closed for modification

### Unit Tests (F.I.R.S.T.)
- **Fast**: Run quickly
- **Independent**: No dependencies between tests
- **Repeatable**: Same results every time
- **Self-validating**: Boolean pass/fail
- **Timely**: Written before or with code

```java
@Test
void shouldDecreaseBalance_WhenWithdrawalIsValid() {
    // Arrange
    Account account = new Account("123", BigDecimal.valueOf(100));

    // Act
    account.withdraw(BigDecimal.valueOf(30));

    // Assert
    assertThat(account.getBalance()).isEqualTo(BigDecimal.valueOf(70));
}
```

### Code Quality Principles
- **DRY** (Don't Repeat Yourself): No duplication
- **YAGNI** (You Aren't Gonna Need It): Don't build for hypothetical futures
- **KISS** (Keep It Simple): Avoid unnecessary complexity
- **Boy Scout Rule**: Leave code cleaner than you found it

### Code Smells to Avoid
| Smell | Solution |
|-------|----------|
| Long functions/classes | Extract smaller methods/classes |
| Duplicate code | Extract common logic |
| Dead code | Delete unused variables/functions |
| Feature envy | Move method to the class it uses |
| Long parameter lists | Introduce parameter object |
| Primitive obsession | Create value objects |
| Switch/case | Use polymorphism/Strategy pattern |
| Temporary fields | Split class or remove fields |

### System Design Principles
- Separate construction from use (dependency injection)
- Program to interfaces, not implementations
- Favor composition over inheritance
- Apply design patterns when they simplify

## Tech Stack Context
- Java 17+, Spring Boot 3.2+
- Spring Data JPA, QueryDSL/Specification
- MariaDB (primary), MongoDB (logs), Redis (cache)
- Maven, Lombok, MapStruct
- JWT Security, RESTful APIs

## Architectural Patterns

### 1. Layered Architecture
```
Controller -> Service -> Repository -> Entity
     |           |            |
     v           v            v
   DTO      Business    Specification
          Logic/Domain    /QueryDSL
```

Rules:
- Controllers: Handle HTTP, validation, return DTOs - NO business logic
- Services: Business logic, transactions, orchestration - NO HTTP dependencies
- Repositories: Data access only - NO business logic
- Entities: Domain state, relationships - NO DTO conversion

### 2. Dependency Inversion
```java
// GOOD - Depend on abstractions
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway; // Interface

    public OrderService(OrderRepository orderRepository,
                       PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }
}

// BAD - Concrete dependency
@Autowired
private VNPayService vnpayService; // Don't do this
```

## Design Patterns in Practice

### 1. Builder Pattern (Fluent API)
```java
// For complex object construction
Order order = Order.builder()
    .customerId(customerId)
    .items(items)
    .shippingAddress(address)
    .paymentMethod(PaymentMethod.VNPAY)
    .build();

// Alternative without Lombok @Builder issues
public static Order createNew(String customerId, List<Item> items) {
    Order order = new Order();
    order.customerId = customerId;
    order.items = new ArrayList<>(items);
    order.status = OrderStatus.PENDING;
    order.createdAt = Instant.now();
    return order;
}
```

### 2. Strategy Pattern
```java
public interface PaymentGateway {
    PaymentResult process(PaymentRequest request);
    boolean supports(PaymentMethod method);
}

@Service
public class PaymentService {
    private final List<PaymentGateway> gateways;

    public PaymentResult pay(PaymentRequest request) {
        PaymentGateway gateway = gateways.stream()
            .filter(g -> g.supports(request.getMethod()))
            .findFirst()
            .orElseThrow(() -> new UnsupportedPaymentException(request.getMethod()));

        return gateway.process(request);
    }
}

@Component
public class VNPayGateway implements PaymentGateway {
    @Override
    public boolean supports(PaymentMethod method) {
        return method == PaymentMethod.VNPAY;
    }
    // ...
}
```

### 3. Factory Pattern
```java
@Component
public class NotificationFactory {
    public Notification create(OrderStatus status, Order order) {
        return switch (status) {
            case CONFIRMED -> new OrderConfirmedNotification(order);
            case SHIPPED -> new OrderShippedNotification(order);
            case DELIVERED -> new OrderDeliveredNotification(order);
            default -> throw new IllegalArgumentException("Unsupported status: " + status);
        };
    }
}
```

### 4. Specification Pattern (QueryDSL)
```java
public class ProductSpecifications {
    public static Specification<Product> withCategory(Long categoryId) {
        return (root, query, cb) ->
            categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            if (min == null) return cb.lessThanOrEqualTo(root.get("price"), max);
            if (max == null) return cb.greaterThanOrEqualTo(root.get("price"), min);
            return cb.between(root.get("price"), min, max);
        };
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }
}

// Usage
public List<Product> search(ProductSearchRequest request) {
    Specification<Product> spec = Specification.where(ProductSpecifications.isActive())
        .and(ProductSpecifications.withCategory(request.getCategoryId()))
        .and(ProductSpecifications.priceBetween(request.getMinPrice(), request.getMaxPrice()));

    return productRepository.findAll(spec, PageRequest.of(0, 20));
}
```

### 5. Template Method Pattern
```java
public abstract class BaseImportService<T> {

    public ImportResult importData(MultipartFile file) {
        validateFile(file);
        List<T> items = parseFile(file);
        validateItems(items);
        return saveItems(items);
    }

    protected abstract void validateFile(MultipartFile file);
    protected abstract List<T> parseFile(MultipartFile file);
    protected abstract void validateItems(List<T> items);
    protected abstract ImportResult saveItems(List<T> items);
}
```

## Clean Code Principles

### 1. Single Responsibility
```java
// BAD - Multiple responsibilities
public class UserService {
    public User createUser(UserRequest request) { ... }
    public void sendWelcomeEmail(User user) { ... }  // Wrong place
    public void generateInvoice(User user) { ... }   // Wrong place
}

// GOOD - Separate concerns
@Service
public class UserService {
    private final NotificationService notificationService;

    public User createUser(UserRequest request) {
        User user = saveUser(request);
        notificationService.sendWelcome(user);
        return user;
    }
}

@Service
public class NotificationService {
    public void sendWelcome(User user) { ... }
}
```

### 2. Open/Closed Principle
```java
// Extend behavior without modifying
public interface PricingStrategy {
    BigDecimal calculatePrice(Product product, Customer customer);
}

@Component
public class RegularPricing implements PricingStrategy { ... }

@Component
public class VipPricing implements PricingStrategy { ... }

@Component
public class SeasonalPricing implements PricingStrategy { ... }

// Usage - closed for modification, open for extension
@Service
public class PriceCalculator {
    private final List<PricingStrategy> strategies;

    public BigDecimal calculate(Product product, Customer customer) {
        return strategies.stream()
            .filter(s -> s.appliesTo(customer))
            .findFirst()
            .map(s -> s.calculatePrice(product, customer))
            .orElse(product.getBasePrice());
    }
}
```

### 3. Method Naming Conventions
```java
// Queries - return boolean
boolean existsByEmail(String email);
boolean isActive(Long userId);

// Commands - void or result
void activateUser(Long userId);
Order createOrder(CreateOrderRequest request);

// Find/Fetch - return optional or list
Optional<User> findById(Long id);
List<Order> findByUserId(Long userId);

// Get - throw if not found (convenience)
User getById(Long id) {
    return findById(id)
        .orElseThrow(() -> new NotFoundException("User", id));
}
```

### 4. DTO Design
```java
// Request DTOs - validation annotations
public record CreateOrderRequest(
    @NotNull @Size(min = 1) List<OrderItemRequest> items,
    @NotNull @Valid ShippingAddressRequest shippingAddress,
    @NotNull PaymentMethod paymentMethod
) {}

// Response DTOs - immutable, no validation
public record OrderResponse(
    Long id,
    String orderNumber,
    OrderStatus status,
    BigDecimal totalAmount,
    Instant createdAt,
    List<OrderItemResponse> items
) {}

// Projection DTOs for read-only queries
public interface OrderSummary {
    Long getId();
    String getOrderNumber();
    BigDecimal getTotalAmount();
}
```

## Transaction Boundaries

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;

    @Transactional
    public Order createOrder(CreateOrderRequest request) {
        // 1. Validate and reserve inventory
        InventoryReservation reservation = inventoryService.reserve(request.getItems());

        // 2. Create order
        Order order = Order.create(request, reservation);
        orderRepository.save(order);

        // 3. Process payment (idempotent)
        paymentService.initiatePayment(order);

        return order;
    }

    @Transactional(readOnly = true)
    public OrderDetails getOrderDetails(Long orderId) {
        // Complex read - still within transaction
        Order order = orderRepository.findWithItemsById(orderId)
            .orElseThrow(() -> new NotFoundException("Order", orderId));

        return orderMapper.toDetails(order);
    }
}
```

## Exception Handling

```java
// Domain exceptions
public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Map<String, Object> details;
}

public class NotFoundException extends BusinessException {
    public NotFoundException(String resource, Object id) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
            Map.of("resource", resource, "id", id));
    }
}

// Global handler
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        return ResponseEntity
            .status(e.getErrorCode().getHttpStatus())
            .body(ErrorResponse.of(e));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> Objects.requireNonNullElse(error.getDefaultMessage(), "Invalid")
            ));

        return ResponseEntity.badRequest()
            .body(ErrorResponse.validationFailed(errors));
    }
}
```

## Caching Strategies

```java
@Cacheable(value = "products", key = "#id")
public ProductResponse getProduct(Long id) {
    return productRepository.findById(id)
        .map(productMapper::toResponse)
        .orElseThrow(() -> new NotFoundException("Product", id));
}

@CacheEvict(value = "products", key = "#request.id")
@CachePut(value = "products", key = "#result.id")
public ProductResponse updateProduct(UpdateProductRequest request) {
    // ... update logic
}

@Cacheable(value = "product-list", key = "#request.hashCode()")
public Page<ProductResponse> searchProducts(ProductSearchRequest request) {
    // ... search logic
}
```

## Testing Patterns

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private InventoryService inventoryService;
    @InjectMocks private OrderService orderService;

    @Test
    void shouldCreateOrder_WhenInventoryAvailable() {
        // Given
        CreateOrderRequest request = createOrderRequest();
        when(inventoryService.reserve(any())).thenReturn(reservation());
        when(orderRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // When
        Order result = orderService.createOrder(request);

        // Then
        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
        verify(inventoryService).reserve(request.getItems());
    }

    @Test
    void shouldThrow_WhenInsufficientInventory() {
        // Given
        CreateOrderRequest request = createOrderRequest();
        when(inventoryService.reserve(any()))
            .thenThrow(new InsufficientInventoryException("SKU-001", 5, 2));

        // When/Then
        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(InsufficientInventoryException.class)
            .hasMessageContaining("SKU-001");

        verify(orderRepository, never()).save(any());
    }
}

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    void shouldReturn401_WhenUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/orders"))
            .andExpect(status().isUnauthorized());
    }
}
```

## Async Processing

```java
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class NotificationService {

    @Async("taskExecutor")
    public CompletableFuture<Void> sendBulkNotifications(List<User> users, String message) {
        users.forEach(user -> sendNotification(user, message));
        return CompletableFuture.completedFuture(null);
    }
}

// Event-driven async
@Component
public class OrderEventListener {

    @EventListener
    @Async
    public void handleOrderCreated(OrderCreatedEvent event) {
        // Send email, update analytics, etc.
    }
}
```

## Common Coding Rules

### 1. No Wildcard Imports
```java
// BAD
import java.util.*;
import com.phonestore.entity.*;

// GOOD
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.phonestore.entity.Order;
import com.phonestore.entity.User;
```

### 2. No Magic Numbers or Strings
```java
// BAD - Magic numbers
if (status == 1) { ... }
if (retryCount > 3) { ... }
Thread.sleep(60000); // What is this?

// GOOD - Named constants
public class OrderConstants {
    public static final int STATUS_PENDING = 1;
    public static final int STATUS_CONFIRMED = 2;
    public static final int MAX_RETRY_ATTEMPTS = 3;
    public static final long PAYMENT_TIMEOUT_MILLIS = 60_000; // 1 minute
}

if (status == OrderConstants.STATUS_PENDING) { ... }
if (retryCount > OrderConstants.MAX_RETRY_ATTEMPTS) { ... }

// Or use enums
public enum OrderStatus {
    PENDING(1), CONFIRMED(2), SHIPPED(3), DELIVERED(4), CANCELLED(5);

    private final int code;

    OrderStatus(int code) {
        this.code = code;
    }

    public int getCode() { return code; }
}
```

### 3. Comprehensive Logging with Context
```java
@Slf4j
@Service
public class OrderService {

    public Order createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}, items count: {}",
            request.getCustomerId(),
            request.getItems().size());

        try {
            Order order = processOrder(request);
            log.info("Order created successfully: orderId={}, orderNumber={}, total={}",
                order.getId(),
                order.getOrderNumber(),
                order.getTotalAmount());
            return order;

        } catch (InsufficientInventoryException e) {
            // Log both error message AND exception for full stack trace
            log.error("Order creation failed due to insufficient inventory. " +
                "customerId={}, sku={}, requested={}, available={}",
                request.getCustomerId(),
                e.getSku(),
                e.getRequestedQuantity(),
                e.getAvailableQuantity(),
                e);  // Exception as last parameter
            throw e;

        } catch (PaymentException e) {
            log.error("Payment processing failed for order. " +
                "customerId={}, paymentMethod={}, amount={}, errorCode={}",
                request.getCustomerId(),
                request.getPaymentMethod(),
                request.getTotalAmount(),
                e.getErrorCode(),
                e);
            throw new OrderCreationException("Payment failed", e);

        } catch (Exception e) {
            log.error("Unexpected error creating order. " +
                "customerId={}, request={}",
                request.getCustomerId(),
                request,
                e);
            throw new OrderCreationException("Failed to create order", e);
        }
    }

    // Structured logging for production
    public void logAuditEvent(String action, Object entity, User user) {
        log.info("AUDIT: action={}, entityType={}, entityId={}, userId={}, timestamp={}",
            action,
            entity.getClass().getSimpleName(),
            getEntityId(entity),
            user.getId(),
            Instant.now());
    }
}
```

### 4. Early Return / Fail Fast
```java
// BAD - Deep nesting
public void processOrder(Order order) {
    if (order != null) {
        if (order.getStatus() == OrderStatus.PENDING) {
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                // ... actual logic
            } else {
                throw new IllegalArgumentException("Order has no items");
            }
        } else {
            throw new IllegalStateException("Order is not pending");
        }
    } else {
        throw new IllegalArgumentException("Order is null");
    }
}

// GOOD - Early returns
public void processOrder(Order order) {
    if (order == null) {
        throw new IllegalArgumentException("Order is null");
    }

    if (order.getStatus() != OrderStatus.PENDING) {
        throw new IllegalStateException("Order is not pending. Current status: " + order.getStatus());
    }

    if (CollectionUtils.isEmpty(order.getItems())) {
        throw new IllegalArgumentException("Order has no items");
    }

    // ... actual logic - flat, readable
}
```

### 5. String Concatenation
```java
// BAD - String concat in loop
String sql = "SELECT * FROM orders WHERE ";
for (Condition condition : conditions) {
    sql += condition.getColumn() + " = " + condition.getValue() + " AND ";
}

// GOOD - StringBuilder
StringBuilder sql = new StringBuilder("SELECT * FROM orders WHERE ");
for (int i = 0; i < conditions.size(); i++) {
    if (i > 0) {
        sql.append(" AND ");
    }
    Condition condition = conditions.get(i);
    sql.append(condition.getColumn()).append(" = ?");
}

// Or better - use proper query builders
// Spring Data JPA Specifications, QueryDSL, or JPA Criteria API
```

### 6. equals() and hashCode() for Entities
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Use only ID for equals/hashCode in JPA entities
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Order)) return false;
        Order order = (Order) o;
        return id != null && id.equals(order.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // NEVER use fields that may change or be lazy-loaded
    // BAD:
    // @Override public int hashCode() {
    //     return Objects.hash(id, customer, items); // items may be lazy-loaded!
    // }
}
```

### 7. Avoid String for IDs/Types - Use Strong Types
```java
// BAD - Primitives everywhere
public void updateStatus(String orderId, int newStatus) { ... }

// GOOD - Type-safe
public record OrderId(Long value) {
    public OrderId {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException("Invalid order ID");
        }
    }
}

public void updateStatus(OrderId orderId, OrderStatus newStatus) { ... }

// Usage - cannot mix up parameters, compiler enforces types
updateStatus(new OrderId(123L), OrderStatus.CONFIRMED);
```

### 8. Validation at Boundaries
```java
@RestController
@RequestMapping("/api/v1/orders")
@Validated
public class OrderController {

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @RequestBody @Valid CreateOrderRequest request) {
        // Request is already validated by @Valid
        return ResponseEntity.ok(orderService.create(request));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> get(
            @PathVariable @Positive Long orderId) {
        return ResponseEntity.ok(orderService.getById(orderId));
    }
}

// DTO with validation
public record CreateOrderRequest(
    @NotNull
    @Size(min = 1, max = 100)
    List<@Valid OrderItemRequest> items,

    @NotBlank
    @Pattern(regexp = "\\+?[0-9]{10,15}")
    String phoneNumber,

    @NotNull
    @Min(0)
    BigDecimal totalAmount
) {}
```

### 9. Use Collectors.toList() vs Stream.toList()
```java
// Returns mutable ArrayList - use when you need to modify the list
List<String> mutable = items.stream()
    .map(Item::getName)
    .collect(Collectors.toList()); // Can add/remove elements

// Returns immutable List - use for read-only
List<String> immutable = items.stream()
    .map(Item::getName)
    .toList(); // Java 16+, unmodifiable

// For parallel streams, always use collect
List<String> parallelResult = items.parallelStream()
    .map(Item::getName)
    .collect(Collectors.toList()); // Thread-safe collection
```

### 10. Proper Resource Management
```java
// BAD - Resource leak
public String readFile(String path) {
    BufferedReader reader = new BufferedReader(new FileReader(path));
    return reader.readLine();
}

// GOOD - Try-with-resources
public String readFile(String path) {
    try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
        return reader.readLine();
    } catch (IOException e) {
        log.error("Failed to read file: {}", path, e);
        throw new FileReadException("Cannot read: " + path, e);
    }
}

// Multiple resources
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(SQL);
     ResultSet rs = ps.executeQuery()) {
    // Process results
} catch (SQLException e) {
    log.error("Database query failed", e);
    throw new DataAccessException("Query failed", e);
}
```

## Code Generation Checklist

When generating Spring Boot code, ensure:

1. **Imports**: No wildcard imports, all explicit
2. **Lombok**: Use `@RequiredArgsConstructor` for DI, avoid `@Builder` (known issues)
3. **Validation**: Use Bean Validation on request DTOs
4. **Transactions**: Mark write operations `@Transactional`
5. **Null Safety**: Use `Optional` for nullable returns, validate inputs
6. **Logging**: Use SLF4J with error context AND exception: `log.error("msg: {}", data, e)`
7. **Pagination**: Always paginate list endpoints
8. **Security**: Check authentication/authorization at controller level
9. **Idempotency**: Design APIs to be retry-safe
10. **Documentation**: Add OpenAPI annotations for public APIs
11. **No Magic Numbers**: Use named constants or enums
12. **Early Returns**: Avoid deep nesting, fail fast
13. **equals/hashCode**: Use only ID for JPA entities
14. **Resource Management**: Use try-with-resources
15. **Stream.toList()**: Use for immutable lists, Collectors.toList() for mutable
