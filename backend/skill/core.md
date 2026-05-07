# Core Java Development Skill

## Role Definition
Act as a Senior Java Developer with deep expertise in core Java, design patterns, and software architecture. Focus on writing maintainable, testable, and performant code.

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

## Core Principles

### 1. SOLID Principles

#### Single Responsibility
```java
// BAD - Multiple reasons to change
public class ReportService {
    public void generateReport() { ... }
    public void printReport() { ... }
    public void emailReport() { ... }
}

// GOOD - Each class has one job
public class ReportGenerator { ... }
public class ReportPrinter { ... }
public class ReportEmailer { ... }
```

#### Open/Closed
```java
// Open for extension, closed for modification
public interface DiscountPolicy {
    BigDecimal applyDiscount(BigDecimal price);
}

public class PercentageDiscount implements DiscountPolicy { ... }
public class FixedAmountDiscount implements DiscountPolicy { ... }
public class NoDiscount implements DiscountPolicy { ... }
```

#### Liskov Substitution
```java
// Subtypes must be substitutable for base types
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) { this.width = width; }
    public void setHeight(int height) { this.height = height; }
    public int area() { return width * height; }
}

// BAD - Square breaks LSP
public class Square extends Rectangle {
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // Surprise!
    }
}

// GOOD - Use composition
public class Shape {
    protected final int width;
    protected final int height;
    // Immutable, no surprises
}
```

#### Interface Segregation
```java
// BAD - Fat interface
public interface Worker {
    void work();
    void eat();
    void sleep();
}

// GOOD - Segregated interfaces
public interface Workable {
    void work();
}

public interface Feedable {
    void eat();
}

public interface Restable {
    void sleep();
}

public class Human implements Workable, Feedable, Restable { ... }
public class Robot implements Workable { ... }
```

#### Dependency Inversion
```java
// High-level modules depend on abstractions
public interface MessageSender {
    void send(String message, String recipient);
}

public class NotificationService {
    private final MessageSender sender; // Depends on abstraction

    public NotificationService(MessageSender sender) {
        this.sender = sender;
    }
}
```

### 2. DRY (Don't Repeat Yourself)
```java
// Extract common logic
public class ValidationUtils {
    public static void notNull(Object obj, String field) {
        if (obj == null) {
            throw new IllegalArgumentException(field + " must not be null");
        }
    }

    public static void notBlank(String str, String field) {
        if (str == null || str.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
    }

    public static void positive(long value, String field) {
        if (value <= 0) {
            throw new IllegalArgumentException(field + " must be positive");
        }
    }
}

// Usage
public class User {
    public User(String email, String name, int age) {
        ValidationUtils.notBlank(email, "email");
        ValidationUtils.notBlank(name, "name");
        ValidationUtils.positive(age, "age");
        // ...
    }
}
```

### 3. KISS (Keep It Simple, Stupid)
```java
// BAD - Over-engineered
public interface Calculable<T extends Number, R extends Number> {
    R calculate(T a, T b, OperationStrategy<T, R> strategy);
}

// GOOD - Simple and clear
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public int subtract(int a, int b) {
        return a - b;
    }
}
```

## Design Patterns

### Creational Patterns

#### Singleton (Thread-safe)
```java
public class Configuration {
    private static final Configuration INSTANCE = new Configuration();

    private Configuration() {
        // Load config
    }

    public static Configuration getInstance() {
        return INSTANCE;
    }
}

// Or use enum (Joshua Bloch's recommendation)
public enum ConfigurationEnum {
    INSTANCE;

    private final Properties properties = loadProperties();

    public String get(String key) {
        return properties.getProperty(key);
    }
}
```

#### Factory Method
```java
public interface DocumentParser {
    Document parse(InputStream input);
}

public class PdfParser implements DocumentParser { ... }
public class WordParser implements DocumentParser { ... }

public class DocumentParserFactory {
    public DocumentParser getParser(String fileExtension) {
        return switch (fileExtension.toLowerCase()) {
            case "pdf" -> new PdfParser();
            case "doc", "docx" -> new WordParser();
            default -> throw new UnsupportedOperationException("Unknown format: " + fileExtension);
        };
    }
}
```

#### Builder (Fluent)
```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Map.copyOf(builder.headers);
        this.body = builder.body;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String url;
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();
        private String body;

        public Builder url(String url) {
            this.url = url;
            return this;
        }

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder header(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        public Builder body(String body) {
            this.body = body;
            this.method = "POST"; // Default to POST if body present
            return this;
        }

        public HttpRequest build() {
            Objects.requireNonNull(url, "URL is required");
            return new HttpRequest(this);
        }
    }
}

// Usage
HttpRequest request = HttpRequest.builder()
    .url("https://api.example.com/users")
    .method("POST")
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer token")
    .body("{\"name\":\"John\"}")
    .build();
```

### Structural Patterns

#### Adapter
```java
// Legacy payment gateway
public class LegacyPaymentGateway {
    public boolean makePayment(String account, double amount) { ... }
}

// Modern interface
public interface PaymentProcessor {
    PaymentResult process(PaymentRequest request);
}

// Adapter
public class LegacyPaymentAdapter implements PaymentProcessor {
    private final LegacyPaymentGateway legacyGateway;

    @Override
    public PaymentResult process(PaymentRequest request) {
        boolean success = legacyGateway.makePayment(
            request.getAccountNumber(),
            request.getAmount().doubleValue()
        );
        return success ? PaymentResult.success() : PaymentResult.failure();
    }
}
```

#### Decorator
```java
public interface DataSource {
    void write(String data);
    String read();
}

public class FileDataSource implements DataSource { ... }

public abstract class DataSourceDecorator implements DataSource {
    protected final DataSource wrapped;

    protected DataSourceDecorator(DataSource source) {
        this.wrapped = source;
    }

    public void write(String data) {
        wrapped.write(data);
    }

    public String read() {
        return wrapped.read();
    }
}

public class EncryptionDecorator extends DataSourceDecorator {
    public EncryptionDecorator(DataSource source) {
        super(source);
    }

    @Override
    public void write(String data) {
        super.write(encrypt(data));
    }

    @Override
    public String read() {
        return decrypt(super.read());
    }

    private String encrypt(String data) { ... }
    private String decrypt(String data) { ... }
}

// Usage
DataSource source = new EncryptionDecorator(
    new FileDataSource("data.txt")
);
```

#### Facade
```java
// Complex subsystems
public class InventorySystem { ... }
public class PaymentGateway { ... }
public class ShippingService { ... }
public class NotificationService { ... }

// Simplified facade
@Service
public class OrderProcessingFacade {
    private final InventorySystem inventory;
    private final PaymentGateway payment;
    private final ShippingService shipping;
    private final NotificationService notification;

    public OrderResult processOrder(OrderRequest request) {
        // Check inventory
        if (!inventory.isAvailable(request.getItems())) {
            return OrderResult.outOfStock();
        }

        // Reserve items
        inventory.reserve(request.getItems());

        // Process payment
        PaymentResult paymentResult = payment.charge(request.getPayment());
        if (!paymentResult.isSuccess()) {
            inventory.release(request.getItems());
            return OrderResult.paymentFailed(paymentResult.getError());
        }

        // Create shipment
        Shipment shipment = shipping.createShipment(request);

        // Send notification
        notification.sendOrderConfirmation(request.getCustomerEmail(), shipment);

        return OrderResult.success(shipment);
    }
}
```

### Behavioral Patterns

#### Observer
```java
public interface OrderObserver {
    void onOrderCreated(Order order);
    void onOrderShipped(Order order);
    void onOrderDelivered(Order order);
}

public class OrderSubject {
    private final List<OrderObserver> observers = new CopyOnWriteArrayList<>();

    public void addObserver(OrderObserver observer) {
        observers.add(observer);
    }

    public void notifyOrderCreated(Order order) {
        observers.forEach(o -> o.onOrderCreated(order));
    }
}

@Component
public class EmailNotificationObserver implements OrderObserver {
    @Override
    public void onOrderCreated(Order order) {
        // Send email
    }
    // ...
}

@Component
public class AnalyticsObserver implements OrderObserver {
    @Override
    public void onOrderCreated(Order order) {
        // Track analytics
    }
    // ...
}
```

#### Strategy
```java
public interface SortStrategy {
    <T extends Comparable<T>> void sort(List<T> list);
}

public class BubbleSortStrategy implements SortStrategy {
    public <T extends Comparable<T>> void sort(List<T> list) {
        // Bubble sort implementation
    }
}

public class QuickSortStrategy implements SortStrategy {
    public <T extends Comparable<T>> void sort(List<T> list) {
        // Quick sort implementation
    }
}

public class Sorter {
    private SortStrategy strategy;

    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public <T extends Comparable<T>> void sort(List<T> list) {
        strategy.sort(list);
    }
}
```

#### Command
```java
public interface Command {
    void execute();
    void undo();
}

public class AddItemCommand implements Command {
    private final ShoppingCart cart;
    private final Item item;
    private final int previousCount;

    public AddItemCommand(ShoppingCart cart, Item item) {
        this.cart = cart;
        this.item = item;
        this.previousCount = cart.getItemCount(item);
    }

    @Override
    public void execute() {
        cart.add(item);
    }

    @Override
    public void undo() {
        cart.setItemCount(item, previousCount);
    }
}

public class CommandInvoker {
    private final Deque<Command> history = new ArrayDeque<>();

    public void execute(Command command) {
        command.execute();
        history.push(command);
    }

    public void undo() {
        if (!history.isEmpty()) {
            history.pop().undo();
        }
    }
}
```

## Functional Programming in Java

### Streams
```java
// Filtering and mapping
List<String> activeUserEmails = users.stream()
    .filter(User::isActive)
    .filter(u -> u.getEmail() != null)
    .map(User::getEmail)
    .distinct()
    .sorted()
    .collect(Collectors.toList());

// Grouping
Map<String, List<User>> usersByDepartment = users.stream()
    .collect(Collectors.groupingBy(User::getDepartment));

// Reducing
BigDecimal totalRevenue = orders.stream()
    .map(Order::getTotal)
    .reduce(BigDecimal.ZERO, BigDecimal::add);

// Partitioning
Map<Boolean, List<Order>> partitioned = orders.stream()
    .collect(Collectors.partitioningBy(o -> o.getStatus() == OrderStatus.COMPLETED));

// Flattening
List<LineItem> allItems = orders.stream()
    .flatMap(o -> o.getItems().stream())
    .toList();
```

### Optional
```java
// Avoid null checks
public String getCity(User user) {
    return Optional.ofNullable(user)
        .map(User::getAddress)
        .map(Address::getCity)
        .orElse("Unknown");
}

// Provide defaults
public BigDecimal getDiscount(User user) {
    return Optional.ofNullable(user.getVipStatus())
        .map(VipStatus::getDiscount)
        .orElse(BigDecimal.ZERO);
}

// Conditional execution
Optional.ofNullable(order)
    .filter(o -> o.getStatus() == OrderStatus.PENDING)
    .ifPresent(this::cancelOrder);

// Chain operations
public record Customer(String name, Address address) {}
public record Address(String street, String city, String zipCode) {}

String zipCode = Optional.ofNullable(customer)
    .map(Customer::address)
    .map(Address::zipCode)
    .filter(z -> z.matches("\\d{5}"))
    .orElseThrow(() -> new IllegalArgumentException("Invalid zip code"));
```

## Error Handling

### Result Type Pattern
```java
public sealed interface Result<T, E> {
    record Success<T, E>(T value) implements Result<T, E> {}
    record Failure<T, E>(E error) implements Result<T, E> {}

    default boolean isSuccess() {
        return this instanceof Success;
    }

    default T getOrThrow() {
        return switch (this) {
            case Success<T, E> s -> s.value();
            case Failure<T, E> f -> throw new IllegalStateException("Failed: " + f.error());
        };
    }
}

// Usage
public Result<Order, OrderError> createOrder(CreateOrderRequest request) {
    if (!inventoryService.isAvailable(request.getItems())) {
        return new Result.Failure<>(OrderError.OUT_OF_STOCK);
    }

    Order order = new Order(request);
    return new Result.Success<>(order);
}

// Caller
Result<Order, OrderError> result = orderService.createOrder(request);
if (result.isSuccess()) {
    Order order = ((Result.Success<Order, OrderError>) result).value();
    // Process order
} else {
    OrderError error = ((Result.Failure<Order, OrderError>) result).error();
    // Handle error
}
```

### Try-Catch Best Practices
```java
// BAD - Swallowing exceptions
try {
    processFile(file);
} catch (Exception e) {
    // Silent failure
}

// GOOD - Specific handling
public void processFile(Path path) throws IOException {
    try (BufferedReader reader = Files.newBufferedReader(path)) {
        // Process file - auto-closeable
    } catch (NoSuchFileException e) {
        logger.error("File not found: {}", path);
        throw new FileProcessingException("File not found: " + path, e);
    } catch (IOException e) {
        logger.error("Error reading file: {}", path, e);
        throw new FileProcessingException("Cannot read file: " + path, e);
    }
}

// Multi-catch
try {
    // Some operation
} catch (SQLException | IOException e) {
    logger.error("Database or IO error", e);
    throw new ServiceException("Operation failed", e);
}
```

## Concurrency

### ExecutorService
```java
public class AsyncProcessor {
    private final ExecutorService executor;

    public AsyncProcessor(int threadPoolSize) {
        this.executor = Executors.newFixedThreadPool(threadPoolSize);
    }

    public <T> CompletableFuture<T> submit(Supplier<T> task) {
        return CompletableFuture.supplyAsync(task, executor);
    }

    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}
```

### CompletableFuture
```java
public CompletableFuture<Order> processOrderAsync(OrderRequest request) {
    return validateRequestAsync(request)
        .thenCompose(this::reserveInventoryAsync)
        .thenCompose(this::processPaymentAsync)
        .thenCompose(this::createShipmentAsync)
        .exceptionally(ex -> {
            logger.error("Order processing failed", ex);
            throw new OrderProcessingException(ex);
        });
}

// Combining futures
CompletableFuture<User> userFuture = fetchUserAsync(userId);
CompletableFuture<OrderHistory> historyFuture = fetchHistoryAsync(userId);

CompletableFuture<UserProfile> profileFuture = userFuture
    .thenCombine(historyFuture, UserProfile::new);
```

## Common Coding Rules

### 1. No Wildcard Imports
```java
// BAD
import java.util.*;
import java.io.*;

// GOOD - Explicit imports
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.io.BufferedReader;
import java.io.FileReader;
```

### 2. No Magic Numbers/Strings - Use Named Constants
```java
// BAD - What do these mean?
if (daysUntilExpiry < 30) { ... }
Thread.sleep(86400000);
return "ERR_001";

// GOOD - Self-documenting code
public class AppConstants {
    public static final int EXPIRY_WARNING_DAYS = 30;
    public static final long ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

    public static final class ErrorCodes {
        public static final String VALIDATION_FAILED = "ERR_VALIDATION_001";
        public static final String NOT_FOUND = "ERR_NOT_FOUND_001";
        public static final String INSUFFICIENT_FUNDS = "ERR_PAYMENT_001";
    }
}

// Usage
if (daysUntilExpiry < EXPIRY_WARNING_DAYS) { ... }
Thread.sleep(ONE_DAY_MILLIS);
return ErrorCodes.VALIDATION_FAILED;

// Even better - Use enums for related constants
public enum HttpStatus {
    OK(200, "Success"),
    BAD_REQUEST(400, "Bad Request"),
    NOT_FOUND(404, "Not Found"),
    SERVER_ERROR(500, "Internal Server Error");

    private final int code;
    private final String message;

    HttpStatus(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int code() { return code; }
    public String message() { return message; }
}
```

### 3. Comprehensive Logging (Error + Exception for Full Trace)
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PaymentProcessor {
    private static final Logger log = LoggerFactory.getLogger(PaymentProcessor.class);

    public PaymentResult process(PaymentRequest request) {
        // Entry logging with context
        log.info("Processing payment: transactionId={}, amount={}, currency={}, method={}",
            request.getTransactionId(),
            request.getAmount(),
            request.getCurrency(),
            request.getPaymentMethod());

        try {
            validateRequest(request);

            PaymentResult result = executePayment(request);

            // Success logging with result
            log.info("Payment processed successfully: transactionId={}, status={}, reference={}",
                request.getTransactionId(),
                result.getStatus(),
                result.getReferenceNumber());

            return result;

        } catch (ValidationException e) {
            // Log ERROR message WITH exception for stack trace
            log.error("Payment validation failed: transactionId={}, field={}, error={}",
                request.getTransactionId(),
                e.getField(),
                e.getMessage(),
                e);  // <-- Exception as last parameter
            throw e;

        } catch (PaymentGatewayException e) {
            // Detailed error with retry info
            log.error("Payment gateway error: transactionId={}, gatewayCode={}, retryable={}, attempt={}",
                request.getTransactionId(),
                e.getGatewayCode(),
                e.isRetryable(),
                e.getAttemptCount(),
                e);  // <-- Full stack trace

            if (e.isRetryable() && e.getAttemptCount() < 3) {
                scheduleRetry(request, e.getAttemptCount() + 1);
            }
            throw new PaymentProcessingException("Gateway error", e);

        } catch (Exception e) {
            // Catch-all: log EVERYTHING
            log.error("Unexpected payment error: transactionId={}, requestType={}, timestamp={}",
                request.getTransactionId(),
                request.getClass().getSimpleName(),
                Instant.now(),
                e);  // <-- Never lose the stack trace
            throw new PaymentProcessingException("Unexpected error", e);
        }
    }

    // Structured logging for audit trails
    public void logAudit(AuditAction action, Object subject, User user) {
        MDC.put("action", action.name());
        MDC.put("subjectId", getSubjectId(subject));
        MDC.put("userId", user.getId().toString());
        MDC.put("timestamp", Instant.now().toString());

        try {
            log.info("AUDIT_LOG: action={}, subjectType={}, subjectId={}, userId={}, ip={}",
                action,
                subject.getClass().getSimpleName(),
                getSubjectId(subject),
                user.getId(),
                user.getIpAddress());
        } finally {
            MDC.clear();
        }
    }
}
```

### 4. Early Return / Fail Fast Pattern
```java
// BAD - Arrow code / Pyramid of doom
public void processUser(User user) {
    if (user != null) {
        if (user.isActive()) {
            if (user.hasPermission("WRITE")) {
                if (user.getQuota() > 0) {
                    // Finally the actual logic
                    performWrite(user);
                } else {
                    throw new QuotaExceededException();
                }
            } else {
                throw new UnauthorizedException("Missing WRITE permission");
            }
        } else {
            throw new InactiveUserException();
        }
    } else {
        throw new IllegalArgumentException("User is null");
    }
}

// GOOD - Guard clauses, flat structure
public void processUser(User user) {
    if (user == null) {
        throw new IllegalArgumentException("User is null");
    }

    if (!user.isActive()) {
        throw new InactiveUserException("User " + user.getId() + " is not active");
    }

    if (!user.hasPermission("WRITE")) {
        throw new UnauthorizedException(
            "User " + user.getId() + " lacks WRITE permission. Current: " + user.getPermissions());
    }

    if (user.getQuota() <= 0) {
        throw new QuotaExceededException(
            "User " + user.getId() + " quota exhausted: " + user.getQuota());
    }

    // Main logic - easy to read
    performWrite(user);
}
```

### 5. String Concatenation Performance
```java
// BAD - String concat in loop (creates many intermediate objects)
String result = "";
for (String item : items) {
    result += item + ", ";  // O(n^2) complexity!
}

// GOOD - StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < items.size(); i++) {
    if (i > 0) {
        sb.append(", ");
    }
    sb.append(items.get(i));
}
String result = sb.toString();

// BETTER - Java 8+ String.join
String result = String.join(", ", items);

// BEST - For complex cases, Streams
String result = items.stream()
    .filter(Objects::nonNull)
    .map(String::toUpperCase)
    .collect(Collectors.joining(", "));
```

### 6. equals() and hashCode() Contracts
```java
public class Money {
    private final BigDecimal amount;
    private final Currency currency;

    public Money(BigDecimal amount, Currency currency) {
        this.amount = Objects.requireNonNull(amount);
        this.currency = Objects.requireNonNull(currency);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money)) return false;
        Money money = (Money) o;
        // Use compareTo for BigDecimal, not equals (0.0 vs 0.00)
        return amount.compareTo(money.amount) == 0 &&
               currency.equals(money.currency);
    }

    @Override
    public int hashCode() {
        // Use scale-independent hash for BigDecimal
        return Objects.hash(amount.stripTrailingZeros(), currency);
    }
}

// For JPA Entities - ID only
@Entity
public class Customer {
    @Id
    private Long id;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Customer)) return false;
        return id != null && id.equals(((Customer) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
```

### 7. Defensive Copying
```java
public class Schedule {
    private final List<Meeting> meetings;
    private final Date startDate;  // Mutable!

    // BAD - Exposes internal state
    public Schedule(List<Meeting> meetings, Date startDate) {
        this.meetings = meetings;  // External can modify!
        this.startDate = startDate;  // External can modify!
    }

    public List<Meeting> getMeetings() {
        return meetings;  // Exposes internal list!
    }

    // GOOD - Defensive copies
    public Schedule(List<Meeting> meetings, Date startDate) {
        this.meetings = new ArrayList<>(meetings);  // Copy
        this.startDate = new Date(startDate.getTime());  // Copy mutable Date
    }

    public List<Meeting> getMeetings() {
        return Collections.unmodifiableList(meetings);  // Read-only view
    }

    // Or return copy
    public List<Meeting> getMeetingsCopy() {
        return new ArrayList<>(meetings);
    }

    // Better - Use immutable types (Java 8+)
    private final Instant startInstant;  // Immutable
    private final List<Meeting> immutableMeetings;

    public Schedule(List<Meeting> meetings, Instant startInstant) {
        this.immutableMeetings = List.copyOf(meetings);  // Java 10+ immutable copy
        this.startInstant = startInstant;  // Already immutable
    }
}
```

### 8. Prefer Strong Types Over Primitives
```java
// BAD - Prone to errors
public void transfer(String fromAccount, String toAccount, double amount, int currency) { ... }

// Called as: transfer("123", "456", 100.0, 840); // What is 840?

// GOOD - Type-safe
public record AccountNumber(String value) {
    public AccountNumber {
        if (value == null || !value.matches("\\d{10}")) {
            throw new IllegalArgumentException("Invalid account number");
        }
    }
}

public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}

public void transfer(AccountNumber from, AccountNumber to, Money amount) { ... }

// Usage - compiler enforces correctness
transfer(
    new AccountNumber("1234567890"),
    new AccountNumber("0987654321"),
    new Money(new BigDecimal("100.00"), Currency.USD)
);
```

### 9. Stream Best Practices
```java
// BAD - Parallel stream on small data (overhead > benefit)
List<String> result = smallList.parallelStream().map(...).toList();

// BAD - Modifying shared state
List<String> result = new ArrayList<>();
items.parallelStream().forEach(result::add);  // Race condition!

// GOOD - Proper stream usage
List<String> result = items.stream()
    .filter(Objects::nonNull)
    .map(String::trim)
    .filter(s -> !s.isEmpty())
    .distinct()
    .sorted()
    .toList();  // Immutable result

// Use parallel only for large datasets with expensive operations
List<BigDecimal> processed = largeList.parallelStream()
    .map(this::expensiveComputation)
    .collect(Collectors.toList());

// findFirst vs findAny
Optional<Item> first = orderedList.stream()
    .filter(Item::isAvailable)
    .findFirst();  // Deterministic, preserves order

Optional<Item> any = unorderedSet.parallelStream()
    .filter(Item::isAvailable)
    .findAny();  // Faster for parallel, order not guaranteed
```

### 10. Proper Resource Handling
```java
// BAD - Resource leak
public String readConfig() {
    FileInputStream fis = new FileInputStream("config.properties");
    Properties props = new Properties();
    props.load(fis);  // If this throws, fis never closed!
    fis.close();
    return props.getProperty("key");
}

// GOOD - Try-with-resources
public String readConfig() {
    try (FileInputStream fis = new FileInputStream("config.properties")) {
        Properties props = new Properties();
        props.load(fis);
        return props.getProperty("key");
    } catch (IOException e) {
        log.error("Failed to load config", e);
        throw new ConfigLoadException("Cannot load config", e);
    }
}

// Multiple resources - order matters (reverse of opening)
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(SQL);
     ResultSet rs = ps.executeQuery()) {

    while (rs.next()) {
        processRow(rs);
    }

} catch (SQLException e) {
    log.error("Database error: SQLState={}, ErrorCode={}",
        e.getSQLState(), e.getErrorCode(), e);
    throw new DataAccessException("Query failed", e);
}

// Cleanup with suppressed exceptions
try (Resource r = acquire()) {
    // Use resource
} catch (Exception e) {
    // e may have suppressed exceptions from close()
    for (Throwable suppressed : e.getSuppressed()) {
        log.warn("Suppressed during close: {}", suppressed.getMessage());
    }
    throw e;
}
```

## Code Quality Checklist

When generating Java code, ensure:

1. **Formatting**: Consistent indentation (4 spaces), proper braces
2. **Naming**: camelCase for variables/methods, PascalCase for classes, UPPER_SNAKE for constants
3. **Immutability**: Prefer `final` fields, immutable collections
4. **Null Safety**: Use `Optional`, validate inputs, fail fast
5. **Generics**: Use type parameters, avoid raw types
6. **Exceptions**: Use checked exceptions for recoverable errors, unchecked for programming errors
7. **Documentation**: JavaDoc for public APIs, inline comments for complex logic
8. **Testing**: Code should be testable, avoid static/singleton dependencies
9. **Resource Management**: Use try-with-resources for closeable resources
10. **Thread Safety**: Document thread-safety guarantees, use proper synchronization
11. **No Wildcard Imports**: All imports must be explicit
12. **No Magic Numbers**: Use named constants or enums
13. **Logging**: Always include context data AND exception: `log.error("msg: {}", data, ex)`
14. **Early Returns**: Guard clauses to avoid deep nesting
15. **equals/hashCode**: Follow contracts, use ID only for JPA entities
16. **Defensive Copying**: Protect mutable internal state
17. **Strong Types**: Prefer value objects over primitives
