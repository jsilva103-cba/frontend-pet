import { Link, NavLink } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/*cabecalho*/}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/pets" className="text-lg font-bold">
            Pet
          </Link>

          <nav className="flex gap-4">
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

            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? "font-semibold" : "text-gray-600"
              }
            >
              login
            </NavLink>
          </nav>
        </div>
      </header>

      {/*conteudo*/}
      <main className="mx-auto max-w-5xl">
        <AppRoutes />
      </main>
    </div>
  );
}
