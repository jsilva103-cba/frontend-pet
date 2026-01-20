import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { AuthTokens, LoginRequest } from "../models/auth";

/**
 * Integração com a API.
 */
export const authService = {
  async login(payload: LoginRequest): Promise<AuthTokens> {
    const { data } = await httpClient.post<AuthTokens>(API.auth.login, payload);
    return data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {

    const { data } = await httpClient.put<AuthTokens>(API.auth.refresh, {
      refreshToken,
    });

    return data;
  },
};
