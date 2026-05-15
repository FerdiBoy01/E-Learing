import { create } from 'zustand';
import api from '../config/axios';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      // Simpan ke local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Simpan ke state Zustand
      set({ user, token, isLoading: false });
      return true;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Terjadi kesalahan saat login', 
        isLoading: false 
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  // Update user data in global state and localStorage
  setUser: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  // Update error state
  setError: (error) => {
    set({ error });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;