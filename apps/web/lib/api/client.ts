import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getStoredToken, clearStoredToken } from "../utils";

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isRedirecting
    ) {
      const path = window.location.pathname;
      const publicPaths = ["/login", "/signup", "/success"];
      if (!publicPaths.some((p) => path.startsWith(p))) {
        isRedirecting = true;
        clearStoredToken();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
