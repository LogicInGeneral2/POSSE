import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

/*
const apiUrl = "/choreo-apis/awbo/backend/rest-api-be2/v1.0";
baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiUrl,
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const api_public = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export { api, api_public };
