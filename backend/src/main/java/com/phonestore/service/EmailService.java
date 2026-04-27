package com.phonestore.service;

import com.phonestore.entity.Order;
import com.phonestore.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@phonestore.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("orderUrl", frontendUrl + "/don-hang/" + order.getOrderNumber());
            context.setVariable("formattedTotal", formatCurrency(order.getTotalAmount()));

            String htmlContent = templateEngine.process("order-confirmation", context);

            sendHtmlEmail(
                    order.getUser().getEmail(),
                    "Xác nhận đơn hàng #" + order.getOrderNumber(),
                    htmlContent
            );

            log.info("Order confirmation email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email", e);
        }
    }

    @Async
    public void sendPaymentConfirmation(Order order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("orderUrl", frontendUrl + "/don-hang/" + order.getOrderNumber());
            context.setVariable("formattedTotal", formatCurrency(order.getTotalAmount()));

            String htmlContent = templateEngine.process("payment-confirmation", context);

            sendHtmlEmail(
                    order.getUser().getEmail(),
                    "Thanh toán thành công - Đơn hàng #" + order.getOrderNumber(),
                    htmlContent
            );

            log.info("Payment confirmation email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send payment confirmation email", e);
        }
    }

    @Async
    public void sendOrderShipped(Order order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("trackingUrl", "#"); // Tracking URL
            context.setVariable("orderUrl", frontendUrl + "/don-hang/" + order.getOrderNumber());

            String htmlContent = templateEngine.process("order-shipped", context);

            sendHtmlEmail(
                    order.getUser().getEmail(),
                    "Đơn hàng #" + order.getOrderNumber() + " đang được giao",
                    htmlContent
            );

            log.info("Order shipped email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order shipped email", e);
        }
    }

    @Async
    public void sendOrderDelivered(Order order) {
        try {
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("orderUrl", frontendUrl + "/don-hang/" + order.getOrderNumber());
            context.setVariable("reviewUrl", frontendUrl + "/danh-gia/" + order.getOrderNumber());

            String htmlContent = templateEngine.process("order-delivered", context);

            sendHtmlEmail(
                    order.getUser().getEmail(),
                    "Đơn hàng #" + order.getOrderNumber() + " đã được giao thành công",
                    htmlContent
            );

            log.info("Order delivered email sent to: {}", order.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to send order delivered email", e);
        }
    }

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("loginUrl", frontendUrl + "/dang-nhap");

            String htmlContent = templateEngine.process("welcome", context);

            sendHtmlEmail(
                    user.getEmail(),
                    "Chào mừng bạn đến với Phone Store",
                    htmlContent
            );

            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email", e);
        }
    }

    @Async
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/dat-lai-mat-khau?token=" + resetToken;

            Context context = new Context();
            context.setVariable("resetUrl", resetUrl);
            context.setVariable("expiryHours", 24);

            String htmlContent = templateEngine.process("password-reset", context);

            sendHtmlEmail(
                    email,
                    "Yêu cầu đặt lại mật khẩu",
                    htmlContent
            );

            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
        }
    }

    @Async
    public void sendLowStockAlert(String adminEmail, String productName, Integer currentStock) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(adminEmail);
            message.setSubject("Cảnh báo tồn kho thấp: " + productName);
            message.setText(String.format(
                    "Sản phẩm %s chỉ còn %d sản phẩm trong kho.\n\nVui lòng kiểm tra và nhập thêm hàng.",
                    productName, currentStock
            ));

            mailSender.send(message);
            log.info("Low stock alert sent for product: {}", productName);
        } catch (Exception e) {
            log.error("Failed to send low stock alert", e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String formatCurrency(BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(amount);
    }
}
