import type { AuthTokens } from "../models/auth";

/**
 * Armazenamento dos tokens.
 */

const STORAGE_KEY = "pet_registry_tokens";

export function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function loadTokens(): AuthTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}
