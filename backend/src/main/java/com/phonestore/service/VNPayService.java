package com.phonestore.service;

import com.phonestore.config.VNPayConfig;
import com.phonestore.dto.response.PaymentResponse;
import com.phonestore.entity.Order;
import com.phonestore.entity.Payment;
import com.phonestore.enums.PaymentMethod;
import com.phonestore.enums.PaymentStatus;
import com.phonestore.repository.OrderRepository;
import com.phonestore.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Transactional
    public PaymentResponse createPayment(Order order, HttpServletRequest request) {
        // Create or get existing payment
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> createNewPayment(order));

        // Build VNPay params
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVnpVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getVnpCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue()));
        vnpParams.put("vnp_CurrCode", vnPayConfig.getVnpCurrCode());
        vnpParams.put("vnp_TxnRef", payment.getTransactionId());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderNumber());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", vnPayConfig.getVnpLocale());
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", getIpAddress(request));
        vnpParams.put("vnp_CreateDate", getCurrentDateTime());
        vnpParams.put("vnp_ExpireDate", getExpireDateTime());

        // Build query string
        String queryUrl = buildQueryString(vnpParams);
        String vnpSecureHash = vnPayConfig.hashAllFields(vnpParams);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        String paymentUrl = vnPayConfig.getVnpPayUrl() + "?" + queryUrl;

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderNumber(order.getOrderNumber())
                .transactionId(payment.getTransactionId())
                .paymentMethod(PaymentMethod.VNPAY)
                .status(payment.getStatus())
                .amount(order.getTotalAmount())
                .currency("VND")
                .paymentUrl(paymentUrl)
                .build();
    }

    @Transactional
    public PaymentResponse processIPN(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        // Validate signature
        if (!vnPayConfig.validateSignature(params, vnpSecureHash)) {
            log.error("Invalid VNPay signature");
            throw new RuntimeException("Invalid signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        Payment payment = paymentRepository.findByTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Order order = payment.getOrder();

        if ("00".equals(responseCode)) {
            // Payment successful
            payment.setStatus(PaymentStatus.PAID);
            payment.setCompletedAt(LocalDateTime.now());
            payment.setProviderTransactionId(transactionNo);
            paymentRepository.save(payment);

            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
            order.setStatus(com.phonestore.enums.OrderStatus.CONFIRMED);
            orderRepository.save(order);

            // Send confirmation email
            emailService.sendOrderConfirmation(order);

            log.info("VNPay payment successful for order: {}", order.getOrderNumber());
        } else {
            // Payment failed
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorCode(responseCode);
            payment.setErrorMessage(getResponseMessage(responseCode));
            paymentRepository.save(payment);

            log.warn("VNPay payment failed for order: {}, code: {}", order.getOrderNumber(), responseCode);
        }

        return mapToPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse processReturn(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String txnRef = params.get("vnp_TxnRef");

        Payment payment = paymentRepository.findByTransactionId(txnRef)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return mapToPaymentResponse(payment);
    }

    private Payment createNewPayment(Order order) {
        Payment payment = Payment.builder()
                .order(order)
                .user(order.getUser())
                .transactionId(generateTransactionId())
                .paymentMethod(PaymentMethod.VNPAY)
                .amount(order.getTotalAmount())
                .currency("VND")
                .status(PaymentStatus.PENDING)
                .initiatedAt(LocalDateTime.now())
                .build();
        return paymentRepository.save(payment);
    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8);
                    return entry.getKey() + "=" + encodedValue;
                })
                .collect(java.util.stream.Collectors.joining("&"));
    }

    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip.split(",")[0].trim();
    }

    private String getCurrentDateTime() {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        return formatter.format(cld.getTime());
    }

    private String getExpireDateTime() {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        cld.add(Calendar.MINUTE, 15);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        return formatter.format(cld.getTime());
    }

    private String generateTransactionId() {
        return "VNP" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String getResponseMessage(String responseCode) {
        Map<String, String> messages = new HashMap<>();
        messages.put("00", "Giao dịch thành công");
        messages.put("01", "Giao dịch đã tồn tại");
        messages.put("02", "Merchant không hợp lệ");
        messages.put("03", "Dữ liệu gửi sang không đúng định dạng");
        messages.put("04", "Không cập nhật được trạng thái");
        messages.put("05", "Không có quyền truy cập");
        messages.put("06", "Lỗi bảo mật");
        messages.put("07", "Giao dịch đang chờ xử lý");
        messages.put("09", "Thẻ/Tài khoản chưa đăng ký dịch vụ");
        messages.put("10", "Xác thực giao dịch không thành công");
        messages.put("11", "Hết hạn chờ thanh toán");
        messages.put("24", "Giao dịch bị hủy");
        messages.put("51", "Tài khoản không đủ số dư");
        messages.put("65", "Tài khoản đã vượt hạn mức");
        messages.put("75", "Ngân hàng thanh toán đang bảo trì");
        messages.put("79", "Nhập sai mật khẩu thanh toán quá số lần");
        messages.put("99", "Lỗi không xác định");

        return messages.getOrDefault(responseCode, "Lỗi không xác định");
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .providerTransactionId(payment.getProviderTransactionId())
                .errorMessage(payment.getErrorMessage())
                .initiatedAt(payment.getInitiatedAt())
                .completedAt(payment.getCompletedAt())
                .build();
    }
}
