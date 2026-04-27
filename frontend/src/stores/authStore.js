import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }))
      },

      logout: () => {
        set(initialState)
        localStorage.removeItem('auth-storage')
      },

      getToken: () => get().token,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
