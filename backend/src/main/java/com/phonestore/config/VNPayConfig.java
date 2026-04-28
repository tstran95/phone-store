package com.phonestore.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@Getter
@Slf4j
public class VNPayConfig {

    @Value("${vnpay.tmn-code:TESTCODE}")
    private String vnpTmnCode;

    @Value("${vnpay.hash-secret:TESTSECRET}")
    private String vnpHashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpPayUrl;

    @Value("${vnpay.return-url:http://localhost:3000/payment/callback}")
    private String vnpReturnUrl;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String vnpApiUrl;

    @Value("${vnpay.version:2.1.0}")
    private String vnpVersion;

    @Value("${vnpay.command:pay}")
    private String vnpCommand;

    @Value("${vnpay.curr-code:VND}")
    private String vnpCurrCode;

    @Value("${vnpay.locale:vn}")
    private String vnpLocale;

    @PostConstruct
    public void init() {
        log.info("VNPay Config loaded - TMN Code: {}, Pay URL: {}", vnpTmnCode, vnpPayUrl);
    }

    public String hashAllFields(Map<String, String> fields) {
        StringBuilder sb = new StringBuilder();
        fields.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    sb.append(entry.getKey());
                    sb.append("=");
                    sb.append(entry.getValue());
                    sb.append("&");
                });

        // Remove last &
        if (sb.length() > 0) {
            sb.setLength(sb.length() - 1);
        }

        return hmacSHA512(vnpHashSecret, sb.toString());
    }

    public String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error hashing data", ex);
            return "";
        }
    }

    public String md5(String message) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error MD5 hashing", ex);
            return "";
        }
    }

    public boolean validateSignature(Map<String, String> params, String receivedSignature) {
        String computedSignature = hashAllFields(params);
        return computedSignature.equalsIgnoreCase(receivedSignature);
    }
}
