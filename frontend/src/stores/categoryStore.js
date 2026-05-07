import { create } from 'zustand'
import { categoryApi } from '../utils/api'

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await categoryApi.getAll()
      // Sắp xếp theo sortOrder nếu có
      const sorted = (res.data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      set({ categories: sorted, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  getCategoryBySlug: (slug) => {
    return get().categories.find((cat) => cat.slug === slug)
  },

  getActiveCategories: () => {
    return get().categories.filter((cat) => cat.isActive !== false)
  },
}))
