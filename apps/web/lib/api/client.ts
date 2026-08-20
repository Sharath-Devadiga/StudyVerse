import axios, { AxiosError } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
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
      const publicPaths = ["/", "/login", "/signup", "/success"];
      if (!publicPaths.some((p) => path.startsWith(p))) {
        isRedirecting = true;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
