import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFacade } from "../../state/authFacade";

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Faz login
      await authFacade.login({ username, password });

      await authFacade.login({ username, password });
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/pets", { replace: true });

  
      // Redireciona para /pets
      navigate("/pets", { replace: true });
    } catch (err) {
      setError("Falha no login. Verifique usuário e senha e tente novamente.");
      console.error("[LoginPage] Erro no login:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center p-6">
        <div className="w-full rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Acessar</h1>
          <p className="mt-1 text-sm text-gray-600">
            Use <span className="font-medium">admin/admin</span> para autenticar.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite o usuário"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
