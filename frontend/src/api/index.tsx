// api.tsx
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"; // Correctly imported
import { refreshAccessToken } from "../services";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN); // Using ACCESS_TOKEN constant
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const success = await refreshAccessToken();
        if (success) {
          const newToken = localStorage.getItem(ACCESS_TOKEN); // Using ACCESS_TOKEN constant
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          handleLogout(); // Log out if refresh fails
          return Promise.reject(error);
        }
      } catch (refreshError) {
        handleLogout(); // Log out on refresh error
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const api_public = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const handleLogout = () => {
  localStorage.removeItem(ACCESS_TOKEN); // Using ACCESS_TOKEN constant
  localStorage.removeItem(REFRESH_TOKEN); // Using REFRESH_TOKEN constant
  window.location.href = "/"; // Redirect to login
};

export { api, api_public };
export { ACCESS_TOKEN, REFRESH_TOKEN }; // Export constants
