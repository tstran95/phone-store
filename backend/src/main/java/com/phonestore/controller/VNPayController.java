package com.phonestore.controller;

import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.PaymentResponse;
import com.phonestore.entity.Order;
import com.phonestore.repository.OrderRepository;
import com.phonestore.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class VNPayController {

    private final VNPayService vnPayService;
    private final OrderRepository orderRepository;

    @GetMapping("/create/{orderNumber}")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @PathVariable String orderNumber,
            HttpServletRequest request) {

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        PaymentResponse payment = vnPayService.createPayment(order, request);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @PostMapping("/ipn")
    public void processIPN(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> params = extractParams(request);

        try {
            PaymentResponse payment = vnPayService.processIPN(params);
            response.getWriter().write("RspCode=00&Message=ConfirmSuccess");
        } catch (Exception e) {
            log.error("IPN processing failed", e);
            response.getWriter().write("RspCode=99&Message=UnknownError");
        }
    }

    @GetMapping("/return")
    public ResponseEntity<ApiResponse<PaymentResponse>> processReturn(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);
        PaymentResponse payment = vnPayService.processReturn(params);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();

        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                params.put(paramName, paramValue);
            }
        }

        return params;
    }
}
