import { BehaviorSubject, map } from "rxjs";
import type { AuthTokens, LoginRequest } from "../models/auth";
import { authService } from "../services/authService";
import { clearTokens, loadTokens, saveTokens } from "./authStorage";

/**
 * AuthFacade
 */
class AuthFacade {
  //runtime
  private readonly tokensSubject = new BehaviorSubject<AuthTokens | null>(
    loadTokens()
  );

  //somente leitura
  public readonly tokens$ = this.tokensSubject.asObservable();

  // usuario autenticado accessToken
  public readonly isAuthenticated$ = this.tokens$.pipe(
    map((t) => Boolean(t?.accessToken))
  );


  public getAccessToken(): string | null {
    return this.tokensSubject.value?.accessToken ?? null;
  }

  public getRefreshToken(): string | null {
    return this.tokensSubject.value?.refreshToken ?? null;
  }

  private setTokens(tokens: AuthTokens | null): void {
    this.tokensSubject.next(tokens);

    if (tokens) saveTokens(tokens);
    else clearTokens();
  }


  public async login(payload: LoginRequest): Promise<void> {
    const tokens = await authService.login(payload);
    this.setTokens(tokens);
  }


  public async refresh(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
       this.setTokens(null);
      throw new Error("Sem refreshToken disponível para renovar sessão.");
    }

    const newTokens = await authService.refresh(refreshToken);
    this.setTokens(newTokens);
    return newTokens;
  }

  /**
   * Logout:
   * - limpa tokens
   */
  public logout(): void {
    this.setTokens(null);
  }
}

export const authFacade = new AuthFacade();
