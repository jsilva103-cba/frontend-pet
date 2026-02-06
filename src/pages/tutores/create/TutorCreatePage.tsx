import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { tutoresService, type TutorUpsertPayload } from "../../../services/tutoresService";
import { TutorForm } from "../_components/TutorForm";

export function TutorCreatePage() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(payload: TutorUpsertPayload) {
    try {
      setError(null);
      setSubmitting(true);

      const created = await tutoresService.create(payload);
      const idOut = String((created as any)?.id ?? (created as any)?._id ?? "");

      if (idOut) navigate(`/tutores/${idOut}`);
      else navigate("/tutores");
    } catch (e) {
      console.error("[TutorCreatePage] erro:", e);
      setError("Não foi possível cadastrar o tutor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo Tutor</h1>
          <p className="text-sm text-gray-600">Cadastro</p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Voltar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <TutorForm
        mode="create"
        submitting={submitting}
        onCancel={() => navigate("/tutores")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
