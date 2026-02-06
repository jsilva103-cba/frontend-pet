import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginPage = lazy(() =>
  import("../pages/login").then((m) => ({ default: m.LoginPage }))
);

const PetsPage = lazy(() =>
  import("../pages/pets").then((m) => ({ default: m.PetsPage }))
);

const PetDetailsPage = lazy(() =>
  import("../pages/pets/details").then((m) => ({
    default: m.PetDetailsPage,
  }))
);

const PetCreatePage = lazy(() =>
  import("../pages/pets/create").then((m) => ({
    default: m.PetCreatePage,
  }))
);

const PetEditPage = lazy(() =>
  import("../pages/pets/edit").then((m) => ({
    default: m.PetEditPage,
  }))
);

const TutoresPage = lazy(() =>
  import("../pages/tutores").then((m) => ({
    default: m.TutoresPage,
  }))
);

const TutorDetailsPage = lazy(() =>
  import("../pages/tutores/details").then((m) => ({
    default: m.TutorDetailsPage,
  }))
);

const TutorCreatePage = lazy(() =>
  import("../pages/tutores/create").then((m) => ({
    default: m.TutorCreatePage,
  }))
);

const TutorEditPage = lazy(() =>
  import("../pages/tutores/edit").then((m) => ({
    default: m.TutorEditPage,
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/pets" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/pets" element={<PetsPage />} />
          <Route path="/pets/novo" element={<PetCreatePage />} />
          <Route path="/pets/:id" element={<PetDetailsPage />} />
          <Route path="/pets/:id/editar" element={<PetEditPage />} />

          <Route path="/tutores" element={<TutoresPage />} />
          <Route path="/tutores/novo" element={<TutorCreatePage />} />
          <Route path="/tutores/:id" element={<TutorDetailsPage />} />
          <Route path="/tutores/:id/editar" element={<TutorEditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/pets" replace />} />
      </Routes>
    </Suspense>
  );
}
