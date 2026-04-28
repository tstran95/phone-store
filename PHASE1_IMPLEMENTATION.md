# Phase 1 Implementation Plan

> Created: 2026-04-28
> Target: Complete in 1-2 weeks

## Tasks Overview

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 1 | Admin Dashboard Layout | ✅ Complete | P0 | Layout, sidebar, routing |
| 2 | Order Detail Page | ✅ Complete | P0 | FE + BE integration |
| 3 | Payment Result Page | ✅ Complete | P0 | VNPay callback handling |
| 4 | Forgot Password Flow | ✅ Complete | P0 | BE APIs + FE pages |
| 5 | Fix VNPay IPN Handler | ✅ Complete | P0 | Update payment status |

**Status: ✅ PHASE 1 COMPLETED**

---

## Detailed Requirements

### 1. Admin Dashboard Layout
**Frontend:**
- [ ] Create `/admin` route
- [ ] Admin sidebar with navigation: Dashboard, Products, Orders, Users, Analytics
- [ ] Admin header with search, notifications, profile
- [ ] Protected route (admin role only)
- [ ] Responsive layout

**Backend:**
- [ ] Add role-based access control (ADMIN, USER)
- [ ] Create admin-specific APIs

### 2. Order Detail Page
**Frontend:**
- [ ] Route: `/don-hang/:orderNumber`
- [ ] Display: order info, items, shipping address, payment status, timeline
- [ ] Cancel order button (if pending)
- [ ] Print invoice button

**Backend:**
- [ ] Ensure `GET /orders/{orderNumber}` returns full details
- [ ] Add order timeline endpoint

### 3. Payment Result Page
**Frontend:**
- [ ] Route: `/thanh-toan/ket-qua`
- [ ] Parse VNPay return params
- [ ] Display success/failure status
- [ ] Show order summary
- [ ] Auto-redirect after 5 seconds

### 4. Forgot Password Flow
**Backend:**
- [ ] `POST /auth/forgot-password` - Send reset email
- [ ] `POST /auth/verify-reset-token` - Validate token
- [ ] `POST /auth/reset-password` - Update password
- [ ] Create PasswordResetToken entity

**Frontend:**
- [ ] `/quen-mat-khau` - Request reset page
- [ ] `/dat-lai-mat-khau?token=xxx` - Reset password page

### 5. Fix VNPay IPN Handler
**Backend:**
- [ ] Verify VNPay signature
- [ ] Update payment status
- [ ] Update order status
- [ ] Send confirmation email
- [ ] Return correct response code

---

## Implementation Log

### 2026-04-28 to 2026-04-29
- Created implementation plan
- Created 5 tasks for tracking

- ✅ **Task 1 Complete**: Admin Dashboard Layout
  - Created AdminLayout component with sidebar, header
  - Created AdminDashboard with stats cards and recent orders
  - Updated App.jsx with admin routes
  - Protected admin routes (require ADMIN role)

- ✅ **Task 2 Complete**: Order Detail Page
  - Created OrderDetail component
  - Added route `/don-hang/:orderNumber`
  - Full order info display with timeline
  - Cancel order functionality
  - Print invoice support

- ✅ **Task 3 Complete**: Payment Result Page
  - Created PaymentResult component
  - Added route `/thanh-toan/ket-qua`
  - Handle VNPay callback (success/failed)
  - Auto-redirect countdown

- ✅ **Task 4 Complete**: Forgot Password Flow
  - Backend:
    - Created PasswordResetToken entity
    - Created repository with custom queries
    - Added 3 APIs: forgot-password, verify-reset-token, reset-password
    - Updated AuthService with password reset logic
  - Frontend:
    - Created ForgotPassword page
    - Created ResetPassword page
    - Updated authApi with new endpoints
    - Added routes to App.jsx

- ✅ **Task 5 Complete**: VNPay IPN Handler (Verified)
  - VNPayService already has full IPN implementation
  - Validates signature
  - Updates payment status
  - Updates order status
  - Sends confirmation email
  - Returns correct response codes

---

## Code Review Checklist

Before marking complete:
- [ ] All new APIs have proper validation
- [ ] Error handling with meaningful messages
- [ ] Frontend responsive on mobile
- [ ] No console errors
- [ ] Tested happy path and edge cases
