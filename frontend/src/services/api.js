import axios from 'axios';

console.log('Loaded API URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function setAccessToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function isPublicPath() {
  const publicPaths = ['/login', '/register'];
  return publicPaths.includes(window.location.pathname);
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setAccessToken(null);
}

function handleUnauthorized() {
  clearAuth();
  if (!isPublicPath()) {
    window.location.href = '/login';
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
