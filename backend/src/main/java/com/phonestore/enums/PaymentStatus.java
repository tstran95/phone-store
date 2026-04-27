package com.phonestore.enums;

public enum PaymentStatus {
    PENDING,    // Chờ thanh toán
    PROCESSING, // Đang xử lý
    PAID,       // Đã thanh toán
    FAILED,     // Thanh toán thất bại
    REFUNDED    // Đã hoàn tiền
}
