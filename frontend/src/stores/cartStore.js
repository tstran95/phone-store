import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,
      sessionId: null,

      // Thêm sản phẩm vào giỏ
      addItem: (product, variant = null, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(
          (item) =>
            item.productId === product.id &&
            item.variantId === (variant?.id || null)
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.productId === product.id &&
              item.variantId === (variant?.id || null)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: `${product.id}-${variant?.id || 'default'}`,
                productId: product.id,
                variantId: variant?.id || null,
                name: product.name,
                slug: product.slug,
                image: product.thumbnail || product.images?.[0],
                price: variant?.price || product.salePrice || product.basePrice,
                originalPrice: product.basePrice,
                variantName: variant?.name,
                quantity,
                maxQuantity: variant?.stockQuantity || product.stockQuantity,
              },
            ],
          })
        }
      },

      // Cập nhật số lượng
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      },

      // Xóa sản phẩm
      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        })
      },

      // Xóa toàn bộ
      clearCart: () => {
        set({ items: [], coupon: null, discount: 0 })
      },

      // Áp dụng mã giảm giá
      applyCoupon: (coupon) => {
        set({ coupon, discount: coupon.discountValue })
      },

      // Xóa mã giảm giá
      removeCoupon: () => {
        set({ coupon: null, discount: 0 })
      },

      // Tổng số sản phẩm
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // Tổng tiền (chưa giảm giá)
      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },

      // Tổng tiền (có giảm giá)
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().discount
        return Math.max(0, subtotal - discount)
      },

      // Get or create session ID for guest cart
      getSessionId: () => {
        let sessionId = get().sessionId
        if (!sessionId) {
          sessionId = generateSessionId()
          set({ sessionId })
        }
        return sessionId
      },

      // Clear session ID after cart merge
      clearSessionId: () => set({ sessionId: null }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
