import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Tutor } from "../../../models/tutor";
import { tutoresService, type TutorUpsertPayload } from "../../../services/tutoresService";
import { TutorForm } from "../_components/TutorForm";

export function TutorEditPage() {
  const { id } = useParams<{ id: string }>();
  const tutorId = useMemo(() => (id ? String(id) : ""), [id]);
  const navigate = useNavigate();

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);

        if (!tutorId) {
          setError("ID do tutor não informado.");
          return;
        }

        const t = await tutoresService.byId(tutorId);
        setTutor(t);
      } catch (e) {
        console.error("[TutorEditPage] erro:", e);
        setError("Não foi possível carregar o tutor para edição.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [tutorId]);

  async function handleSubmit(payload: TutorUpsertPayload) {
    try {
      setError(null);
      setSubmitting(true);

      const updated = await tutoresService.update(tutorId, payload);
      const idOut = String((updated as any)?.id ?? (updated as any)?._id ?? tutorId);

      navigate(`/tutores/${idOut}`);
    } catch (e) {
      console.error("[TutorEditPage] erro:", e);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Tutor</h1>
          <p className="text-sm text-gray-600">ID: #{tutorId || "—"}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Voltar
        </button>
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">Carregando...</div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && tutor && (
        <TutorForm
          mode="edit"
          initial={tutor as any}
          submitting={submitting}
          onCancel={() => navigate(-1)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
