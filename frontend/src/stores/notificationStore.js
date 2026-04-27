import { create } from 'zustand'
import { notificationApi } from '../utils/api'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  eventSource: null,

  fetchNotifications: async (page = 0, size = 20) => {
    set({ isLoading: true })
    try {
      const res = await notificationApi.getAll(page, size)
      set({ notifications: res.data?.content || [], isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationApi.getUnreadCount()
      set({ unreadCount: res.data || 0 })
    } catch {
      // silently fail
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationApi.markAsRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {
      // silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationApi.markAllAsRead()
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
    } catch {
      // silently fail
    }
  },

  subscribe: () => {
    const { eventSource } = get()
    if (eventSource) return

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage'))?.state?.token
      : null

    const es = new EventSource(`${API_BASE_URL}/notifications/subscribe`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    es.addEventListener('notification', (event) => {
      const data = JSON.parse(event.data)
      set((state) => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }))
    })

    es.onerror = () => {
      es.close()
      set({ eventSource: null })
    }

    set({ eventSource: es })
  },

  unsubscribe: () => {
    const { eventSource } = get()
    if (eventSource) {
      eventSource.close()
      set({ eventSource: null })
    }
  },
}))
