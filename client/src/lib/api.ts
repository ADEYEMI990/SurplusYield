// client/src/lib/api.ts
import axios from "axios";
import useAuthStore from "../stores/authStore";

const API = axios.create({
  baseURL: "/api", // thanks to your Vite proxy, this points to localhost:5000 in dev
});

// Attach token automatically
API.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},  (error) => Promise.reject(error));

// Handle expired / invalid tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { role, logout } = useAuthStore.getState();
      logout();

      if (role === "admin") {
        window.location.href = "/auth/login-admin";
      } else {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;