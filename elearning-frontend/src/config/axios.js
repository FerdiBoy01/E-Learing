import axios from 'axios';

// Buat instance axios dengan base URL backend kita
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 detik timeout
});

// Interceptor untuk meletakkan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani error dari backend (misal: Token Expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Koneksi internet gagal. Silakan cek koneksi Anda.';
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Backend mungkin sedang down.';
    }
    
    return Promise.reject(error);
  }
);

export default api;