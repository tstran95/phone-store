package com.phonestore.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.ThreadContext;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

// Tạm thởi disable để test JWT
// @Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class TraceTokenFilter implements Filter {

    private static final String TRACE_TOKEN_KEY = "traceToken";
    private static final String START_TIME_KEY = "startTime";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Wrap request to read body multiple times
        RequestWrapper wrappedRequest = new RequestWrapper(httpRequest);
        // Wrap response to capture body
        ResponseWrapper wrappedResponse = new ResponseWrapper(httpResponse);

        // Generate or get trace token
        String traceToken = httpRequest.getHeader("X-Trace-Token");
        if (traceToken == null || traceToken.isEmpty()) {
            traceToken = generateTraceToken();
        }

        // Put trace token in ThreadContext for Log4j2
        ThreadContext.put(TRACE_TOKEN_KEY, traceToken);

        // Record start time
        long startTime = System.currentTimeMillis();
        ThreadContext.put(START_TIME_KEY, String.valueOf(startTime));

        // Extract request info
        String method = httpRequest.getMethod();
        String uri = httpRequest.getRequestURI();
        String queryString = httpRequest.getQueryString();
        String clientIp = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        String fullPath = queryString != null ? uri + "?" + queryString : uri;

        try {
            // Log request start
            log.info("[REQUEST_START] [{}] {} - IP: {} - UserAgent: {}",
                    method, fullPath, clientIp, userAgent);

            // Log request headers
            if (log.isDebugEnabled()) {
                log.debug("[REQUEST_HEADERS] ContentType: {} - ContentLength: {} - Token: {}",
                        httpRequest.getContentType(),
                        httpRequest.getContentLength(),
                        traceToken);
            }

            // Log request body for POST, PUT, PATCH
            if (shouldLogRequestBody(method)) {
                String requestBody = wrappedRequest.getBody();
                if (!requestBody.isEmpty() && requestBody.length() < 10000) {
                    log.info("[REQUEST_BODY] {}", maskSensitiveData(requestBody));
                } else if (requestBody.length() >= 10000) {
                    log.info("[REQUEST_BODY] Body too large ({} bytes), skipped", requestBody.length());
                }
            }

            chain.doFilter(wrappedRequest, wrappedResponse);

        } finally {
            // Calculate duration
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = wrappedResponse.getStatus();

            // Log response body
            if (shouldLogResponseBody(statusCode)) {
                String responseBody = wrappedResponse.getBody();
                if (!responseBody.isEmpty() && responseBody.length() < 5000) {
                    log.info("[RESPONSE_BODY] {}", maskSensitiveData(responseBody));
                }
            }

            // Log request completion
            if (statusCode >= 500) {
                log.error("[REQUEST_END] [{}] {} - Status: {} - Duration: {}ms - Token: {}",
                        method, fullPath, statusCode, duration, traceToken);
            } else if (statusCode >= 400) {
                log.warn("[REQUEST_END] [{}] {} - Status: {} - Duration: {}ms - Token: {}",
                        method, fullPath, statusCode, duration, traceToken);
            } else {
                log.info("[REQUEST_END] [{}] {} - Status: {} - Duration: {}ms",
                        method, fullPath, statusCode, duration);
            }

            // Clean up ThreadContext
            ThreadContext.remove(TRACE_TOKEN_KEY);
            ThreadContext.remove(START_TIME_KEY);
        }
    }

    private boolean shouldLogRequestBody(String method) {
        return "POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method);
    }

    private boolean shouldLogResponseBody(int statusCode) {
        return statusCode >= 400 || log.isDebugEnabled();
    }

    private String maskSensitiveData(String body) {
        if (body == null || body.isEmpty()) {
            return body;
        }
        // Mask password fields using Pattern
        java.util.regex.Pattern pwdPattern = java.util.regex.Pattern.compile("\"password\"\\s*:\\s*\"[^\"]*\"");
        java.util.regex.Pattern tokenPattern = java.util.regex.Pattern.compile("\"token\"\\s*:\\s*\"[^\"]*\"");
        java.util.regex.Pattern refreshPattern = java.util.regex.Pattern.compile("\"refreshToken\"\\s*:\\s*\"[^\"]*\"");

        String masked = pwdPattern.matcher(body).replaceAll("\"password\":\"***MASKED***\"");
        masked = tokenPattern.matcher(masked).replaceAll("\"token\":\"***MASKED***\"");
        masked = refreshPattern.matcher(masked).replaceAll("\"refreshToken\":\"***MASKED***\"");
        return masked;
    }

    private String generateTraceToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
