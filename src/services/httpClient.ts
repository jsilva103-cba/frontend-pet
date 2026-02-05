import axios from "axios";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
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
  } catch {}

  try {
    const raw = localStorage.getItem("pet_registry_tokens");
    if (!raw) return null;

    const parsed = JSON.parse(raw) as any;

    return parsed?.access_token ?? parsed?.accessToken ?? null;
  } catch {
    return null;
  }
}

function setAccessToken(token: string) {

  try {
    const raw = localStorage.getItem("pet_registry_tokens");
    const parsed = raw ? (JSON.parse(raw) as any) : {};

    const updated = {
      ...parsed,
      access_token: token,
      accessToken: token,
    };

    localStorage.setItem("pet_registry_tokens", JSON.stringify(updated));
  } catch {}
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


let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;

  const client = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });

  refreshPromise = (async () => {
    const token = getAccessToken();
    if (!token) throw new Error("Sem token para refresh.");

    const { data } = await client.put(
      "/autenticacao/refresh",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newToken =
      (data as any)?.access_token ??
      (data as any)?.accessToken ??
      (data as any)?.token ??
      null;

    if (!newToken) throw new Error("Refresh não retornou token.");

    setAccessToken(String(newToken));
    return String(newToken);
  })();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    const originalConfig = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        const newToken = await refreshAccessToken();

        originalConfig.headers = originalConfig.headers ?? {};
        (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;

        return httpClient.request(originalConfig);
      } catch (refreshErr) {
        try {
          authFacade.logout?.();
        } catch {}

        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
