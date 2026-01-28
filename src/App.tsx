import { Link, NavLink, useNavigate } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { useEffect, useState } from "react";

const TOKENS_KEY = "pet_registry_tokens";

function isAuthenticated() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return Boolean(parsed?.access_token);
  } catch {
    return false;
  }
}

export default function App() {
  const navigate = useNavigate();
  const [logged, setLogged] = useState(isAuthenticated());

  // Atualiza
  useEffect(() => {
    const sync = () => setLogged(isAuthenticated());

    // evento das abas
    window.addEventListener("storage", sync);

    // evento na mesma aba 
    window.addEventListener("auth:changed", sync as EventListener);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:changed", sync as EventListener);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem(TOKENS_KEY);
    window.dispatchEvent(new Event("auth:changed"));
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* cabecalho */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/pets" className="text-lg font-bold">
            Pet
          </Link>

          <nav className="flex gap-4 items-center">
            <NavLink
              to="/pets"
              className={({ isActive }) =>
                isActive ? "font-semibold" : "text-gray-600"
              }
            >
              Pets
            </NavLink>

            <NavLink
              to="/tutores"
              className={({ isActive }) =>
                isActive ? "font-semibold" : "text-gray-600"
              }
            >
              Tutores
            </NavLink>

            {!logged ? (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "font-semibold" : "text-gray-600"
                }
              >
                Login
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Sair
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* conteudo */}
      <main className="mx-auto max-w-5xl">
        <AppRoutes />
      </main>
    </div>
  );
}
