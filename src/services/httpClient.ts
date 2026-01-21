import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { authFacade } from "../state/authFacade";



/**
 * Cliente HTTP.
 */

// Base URL 
const baseURL = import.meta.env.VITE_API_BASE_URL as string;

if (!baseURL) {
  // Não é para parar a app.
  console.warn(
    "[httpClient] VITE_API_BASE_URL não definido. erro .env."
  );
}

export const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});


function getAccessToken(): string | null {
  return authFacade.getAccessToken();
}

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
//...
    return Promise.reject(error);
  }
);
