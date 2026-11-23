import axios, { AxiosError, AxiosInstance } from "axios";
import { tokenStorage } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ---------- Request interceptor: attach token ----------
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------- Response interceptor: handle 401 ----------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 = token expired/invalid → clear + redirect to login
    if (error.response?.status === 401) {
      tokenStorage.clear();

      // Only redirect if we're in the browser and not already on login/register
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Error helper: extract message from API response ----------
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

// ---------- Response type ----------
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}