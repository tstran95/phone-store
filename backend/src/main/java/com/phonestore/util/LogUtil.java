package com.phonestore.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.ThreadContext;

import java.util.UUID;

/**
 * Utility class for logging with trace tokens.
 * Helps track requests across multiple log entries.
 */
@Slf4j
public class LogUtil {

    private static final String TRACE_TOKEN_KEY = "traceToken";

    /**
     * Set a custom trace token for the current thread.
     * Useful for async operations or scheduled tasks.
     */
    public static void setTraceToken(String token) {
        ThreadContext.put(TRACE_TOKEN_KEY, token);
    }

    /**
     * Generate and set a new trace token.
     * @return The generated token
     */
    public static String generateAndSetTraceToken() {
        String token = generateTraceToken();
        setTraceToken(token);
        return token;
    }

    /**
     * Get current trace token.
     */
    public static String getCurrentTraceToken() {
        return ThreadContext.get(TRACE_TOKEN_KEY);
    }

    /**
     * Clear the trace token from current thread.
     * Should be called in finally blocks.
     */
    public static void clearTraceToken() {
        ThreadContext.remove(TRACE_TOKEN_KEY);
    }

    /**
     * Log with business context.
     */
    public static void info(String action, String entity, Object id, String message) {
        log.info("[ACTION={}] [ENTITY={}] [ID={}] {}", action, entity, id, message);
    }

    public static void debug(String action, String entity, Object id, String message) {
        log.debug("[ACTION={}] [ENTITY={}] [ID={}] {}", action, entity, id, message);
    }

    public static void error(String action, String entity, Object id, String message, Throwable throwable) {
        log.error("[ACTION={}] [ENTITY={}] [ID={}] {}", action, entity, id, message, throwable);
    }

    public static void warn(String action, String entity, Object id, String message) {
        log.warn("[ACTION={}] [ENTITY={}] [ID={}] {}", action, entity, id, message);
    }

    /**
     * Log API request/response.
     */
    public static void logApiRequest(String method, String path, Object body) {
        log.debug("[API_REQUEST] [{} {}] Body: {}", method, path, body);
    }

    public static void logApiResponse(String method, String path, int status, Object body) {
        log.debug("[API_RESPONSE] [{} {}] Status: {} Body: {}", method, path, status, body);
    }

    /**
     * Log performance metrics.
     */
    public static void logPerformance(String operation, long durationMs) {
        log.info("[PERFORMANCE] [{}] Duration: {}ms", operation, durationMs);
    }

    private static String generateTraceToken() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}
