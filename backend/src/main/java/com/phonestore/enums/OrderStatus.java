package com.phonestore.enums;

public enum OrderStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    PROCESSING,     // Đang xử lý
    SHIPPED,        // Đã giao cho vận chuyển
    DELIVERED,      // Đã giao hàng
    CANCELLED,      // Đã hủy
    REFUNDED,       // Đã hoàn tiền
    RETURNED        // Đã trả hàng
}
