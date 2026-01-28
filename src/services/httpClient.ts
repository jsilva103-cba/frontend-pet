import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { authFacade } from "../state/authFacade";

/**
 * Cliente HTTP
 */

// Base URL
const baseURL = import.meta.env.VITE_API_BASE_URL as string;

if (!baseURL) {
  console.warn("[httpClient] VITE_API_BASE_URL não definido. Verifique o .env");
}

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken(): string | null {
 
  try {
    const token = authFacade.getAccessToken?.();
    if (token) return token;
  } catch {
    
  }


  try {
    const raw = localStorage.getItem("pet_registry_tokens");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as any;

     return parsed?.access_token ?? parsed?.accessToken ?? null;
  } catch {
    return null;
  }
}

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete (config.headers as any).Authorization;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
