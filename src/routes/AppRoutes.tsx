import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginPage = lazy(() =>
  import("../pages/login").then((m) => ({ default: m.LoginPage }))
);

const PetsPage = lazy(() =>
  import("../pages/pets").then((m) => ({ default: m.PetsPage }))
);

const TutoresPage = lazy(() =>
  import("../pages/tutores").then((m) => ({ default: m.TutoresPage }))
);

const PetDetailsPage = lazy(() =>
  import("../pages/pets/details/PetDetailsPage").then((m) => ({
    default: m.PetDetailsPage,
  }))
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
        {/* público */}
        <Route path="/login" element={<LoginPage />} />

        {/* raiz */}
        <Route path="/" element={<Navigate to="/pets" replace />} />

        {/* protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailsPage />} />
          <Route path="/tutores" element={<TutoresPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/pets" replace />} />
      </Routes>
    </Suspense>
  );
}
