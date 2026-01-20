import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";


const LoginPage = lazy(() =>
  import("../pages/login").then((m) => ({ default: m.LoginPage }))
);

const PetsPage = lazy(() =>
  import("../pages/pets").then((m) => ({ default: m.PetsPage }))
);

const TutoresPage = lazy(() =>
  import("../pages/tutores").then((m) => ({ default: m.TutoresPage }))
);

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6">
          <p className="text-gray-600">Carregando...</p>
        </div>
      }
    >
      <Routes>
        {/*inicial*/}
        <Route path="/" element={<Navigate to="/pets" replace />} />

        {/*publica*/}
        <Route path="/login" element={<LoginPage />} />

        {/*telas*/}
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/tutores" element={<TutoresPage />} />

        {/*invalida*/}
        <Route path="*" element={<Navigate to="/pets" replace />} />
      </Routes>
    </Suspense>
  );
}
