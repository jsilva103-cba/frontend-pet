import { Navigate, Outlet, useLocation } from "react-router-dom";

const TOKENS_KEY = "pet_registry_tokens";

function hasAccessToken(): boolean {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw) as { access_token?: string };
    return Boolean(parsed?.access_token);
  } catch {
    return false;
  }
}

export function ProtectedRoute() {
  const location = useLocation();

  const authenticated = hasAccessToken();

  // Se nao estiver autenticado volta /login
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Se estiver autenticado, libera
  return <Outlet />;
}
