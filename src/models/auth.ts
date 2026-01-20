/**
 * - Autenticação.
 * - login username/password
 * - retorno: tokens
 */


export type LoginRequest = {
  username: string;
  password: string;
};

// Retorno
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
