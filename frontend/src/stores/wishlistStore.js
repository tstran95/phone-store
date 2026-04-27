import { create } from 'zustand'
import { wishlistApi } from '../utils/api'

export const useWishlistStore = create((set, get) => ({
  items: [],
  count: 0,
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true })
    try {
      const res = await wishlistApi.getAll()
      set({ items: res.data || [], count: (res.data || []).length, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchCount: async () => {
    try {
      const res = await wishlistApi.getCount()
      set({ count: res.data || 0 })
    } catch {
      // silently fail
    }
  },

  addToWishlist: async (productId) => {
    try {
      const res = await wishlistApi.add({ productId })
      set((state) => ({
        items: [...state.items, res.data],
        count: state.count + 1,
      }))
      return true
    } catch {
      return false
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      await wishlistApi.remove(productId)
      set((state) => ({
        items: state.items.filter((item) => item.product?.id !== productId),
        count: Math.max(0, state.count - 1),
      }))
      return true
    } catch {
      return false
    }
  },

  toggleWishlist: async (productId) => {
    const { items, addToWishlist, removeFromWishlist } = get()
    const exists = items.some((item) => item.product?.id === productId)
    if (exists) {
      return removeFromWishlist(productId)
    }
    return addToWishlist(productId)
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item.product?.id === productId)
  },
}))
