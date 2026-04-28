// ============================================
// MongoDB Initialization Script
// Phone Store E-commerce - Document Collections
// ============================================

db = db.getSiblingDB('phonestore_logs');

// ============================================
// 1. Product Specifications Collection
// Lưu thông số kỹ thuật chi tiết, động của sản phẩm
// ============================================
db.createCollection('product_specs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['product_id', 'specifications', 'created_at'],
            properties: {
                product_id: {
                    bsonType: 'long',
                    description: 'Reference to MariaDB product.id'
                },
                product_name: {
                    bsonType: 'string',
                    description: 'Denormalized product name for search'
                },
                specifications: {
                    bsonType: 'object',
                    description: 'Dynamic specifications based on category',
                    properties: {
                        // Common specs
                        display: { bsonType: 'string' },
                        processor: { bsonType: 'string' },
                        ram: { bsonType: 'string' },
                        storage: { bsonType: 'string' },
                        battery: { bsonType: 'string' },
                        os: { bsonType: 'string' },
                        camera: { bsonType: 'string' },
                        weight: { bsonType: 'string' },
                        dimensions: { bsonType: 'string' },
                        // Connectivity
                        wifi: { bsonType: 'string' },
                        bluetooth: { bsonType: 'string' },
                        nfc: { bsonType: 'bool' },
                        // Additional dynamic fields
                        extras: { bsonType: 'object' }
                    }
                },
                highlights: {
                    bsonType: 'array',
                    items: { bsonType: 'string' },
                    description: 'Key selling points'
                },
                in_the_box: {
                    bsonType: 'array',
                    items: { bsonType: 'string' }
                },
                created_at: { bsonType: 'date' },
                updated_at: { bsonType: 'date' }
            }
        }
    }
});

// Index for product specs
db.product_specs.createIndex({ product_id: 1 }, { unique: true });
db.product_specs.createIndex({ product_name: 'text', 'specifications.processor': 'text' });

// ============================================
// 2. User Activity Logs Collection
// Theo dõi hành vi ngườii dùng
// ============================================
db.createCollection('user_activity_logs', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['user_id', 'activity_type', 'timestamp'],
            properties: {
                user_id: { bsonType: 'long' },
                session_id: { bsonType: 'string' },
                activity_type: {
                    enum: ['LOGIN', 'LOGOUT', 'VIEW_PRODUCT', 'ADD_TO_CART',
                           'REMOVE_FROM_CART', 'SEARCH', 'PURCHASE', 'REVIEW',
                           'WISHLIST_ADD', 'WISHLIST_REMOVE', 'CHECKOUT_START',
                           'PAYMENT_ATTEMPT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED']
                },
                details: {
                    bsonType: 'object',
                    properties: {
                        product_id: { bsonType: 'long' },
                        product_name: { bsonType: 'string' },
                        search_query: { bsonType: 'string' },
                        cart_item_count: { bsonType: 'int' },
                        order_id: { bsonType: 'long' },
                        amount: { bsonType: 'decimal' },
                        ip_address: { bsonType: 'string' },
                        user_agent: { bsonType: 'string' },
                        referrer: { bsonType: 'string' }
                    }
                },
                timestamp: { bsonType: 'date' },
                metadata: { bsonType: 'object' }
            }
        }
    }
});

// TTL index: auto-delete logs after 1 year
db.user_activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
db.user_activity_logs.createIndex({ user_id: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ activity_type: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ 'details.product_id': 1 });

// ============================================
// 3. Search Analytics Collection
// Phân tích từ khóa tìm kiếm
// ============================================
db.createCollection('search_analytics', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['query', 'timestamp'],
            properties: {
                user_id: { bsonType: ['long', 'null'] },
                session_id: { bsonType: 'string' },
                query: { bsonType: 'string' },
                filters: {
                    bsonType: 'object',
                    properties: {
                        category: { bsonType: 'string' },
                        brand: { bsonType: 'string' },
                        price_min: { bsonType: 'decimal' },
                        price_max: { bsonType: 'decimal' },
                        rating: { bsonType: 'int' }
                    }
                },
                results_count: { bsonType: 'int' },
                clicked_product_ids: { bsonType: 'array', items: { bsonType: 'long' } },
                converted: { bsonType: 'bool' },
                response_time_ms: { bsonType: 'int' },
                timestamp: { bsonType: 'date' }
            }
        }
    }
});

// Index cho search analytics
db.search_analytics.createIndex({ query: 'text' });
db.search_analytics.createIndex({ timestamp: -1 });
db.search_analytics.createIndex({ user_id: 1, timestamp: -1 });

// ============================================
// 4. Audit Trail Collection
// Ghi lại mọi thay đổi quan trọng
// ============================================
db.createCollection('audit_trail', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['entity_type', 'entity_id', 'action', 'performed_by', 'timestamp'],
            properties: {
                entity_type: {
                    enum: ['USER', 'PRODUCT', 'ORDER', 'INVENTORY', 'PAYMENT', 'REVIEW']
                },
                entity_id: { bsonType: 'long' },
                action: {
                    enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'REFUND', 'CANCEL']
                },
                performed_by: { bsonType: 'long' },
                performed_by_email: { bsonType: 'string' },
                changes: {
                    bsonType: 'object',
                    properties: {
                        field_name: { bsonType: 'string' },
                        old_value: { bsonType: ['string', 'null'] },
                        new_value: { bsonType: ['string', 'null'] }
                    }
                },
                reason: { bsonType: 'string' },
                ip_address: { bsonType: 'string' },
                timestamp: { bsonType: 'date' }
            }
        }
    }
});

// TTL index: keep audit trail for 3 years
db.audit_trail.createIndex({ timestamp: 1 }, { expireAfterSeconds: 94608000 });
db.audit_trail.createIndex({ entity_type: 1, entity_id: 1 });
db.audit_trail.createIndex({ performed_by: 1, timestamp: -1 });

// ============================================
// 5. Notification Queue Collection
// Queue thông báo (email, push)
// ============================================
db.createCollection('notification_queue', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['type', 'recipient', 'status', 'created_at'],
            properties: {
                type: {
                    enum: ['EMAIL', 'SMS', 'PUSH']
                },
                recipient: { bsonType: 'string' },
                subject: { bsonType: 'string' },
                content: { bsonType: 'string' },
                template_data: { bsonType: 'object' },
                status: {
                    enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'RETRY']
                },
                priority: { bsonType: 'int' },
                retry_count: { bsonType: 'int' },
                error_message: { bsonType: 'string' },
                created_at: { bsonType: 'date' },
                scheduled_at: { bsonType: 'date' },
                sent_at: { bsonType: 'date' }
            }
        }
    }
});

db.notification_queue.createIndex({ status: 1, priority: -1, created_at: 1 });
db.notification_queue.createIndex({ scheduled_at: 1 }, { sparse: true });

// ============================================
// 6. Product Reviews Summary (Materialized View Pattern)
// Tổng hợp đánh giá để query nhanh
// ============================================
db.createCollection('product_review_summary', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['product_id'],
            properties: {
                product_id: { bsonType: 'long' },
                total_reviews: { bsonType: 'int' },
                average_rating: { bsonType: 'decimal' },
                rating_distribution: {
                    bsonType: 'object',
                    properties: {
                        '5': { bsonType: 'int' },
                        '4': { bsonType: 'int' },
                        '3': { bsonType: 'int' },
                        '2': { bsonType: 'int' },
                        '1': { bsonType: 'int' }
                    }
                },
                recent_reviews: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        properties: {
                            user_name: { bsonType: 'string' },
                            rating: { bsonType: 'int' },
                            comment: { bsonType: 'string' },
                            created_at: { bsonType: 'date' }
                        }
                    }
                },
                last_updated: { bsonType: 'date' }
            }
        }
    }
});

db.product_review_summary.createIndex({ product_id: 1 }, { unique: true });
db.product_review_summary.createIndex({ average_rating: -1 });

print('MongoDB collections created successfully!');
print('Collections: product_specs, user_activity_logs, search_analytics, audit_trail, notification_queue, product_review_summary');
