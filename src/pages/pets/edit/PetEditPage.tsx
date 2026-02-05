import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Pet } from "../../../models/pet";
import { petsService } from "../../../services/petsService";
import { PetForm } from "../_components/PetForm";

export function PetEditPage() {
  const { id } = useParams<{ id: string }>();
  const petId = useMemo(() => (id ? String(id) : ""), [id]);

  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);

        if (!petId) {
          setError("ID do pet não informado.");
          return;
        }

        const p = await petsService.byId(petId);
        setPet(p);
      } catch (e) {
        console.error("[PetEditPage] erro:", e);
        setError("Não foi possível carregar o pet para edição.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [petId]);

  async function handleSubmit(payload: any, photo?: File | null) {
    try {
      setError(null);
      setSubmitting(true);

      // 1) Atualiza dados do pet
      const updated = await petsService.update(petId, payload);
      const idOut = (updated as any)?.id ?? (updated as any)?._id ?? petId;

      // 2) Se veio foto, faz upload após salvar
      if (photo) {
        await petsService.uploadFoto(String(idOut), photo);
      }

      // 3) Volta para o detalhe do pet
      navigate(`/pets/${String(idOut)}`, { replace: true });
    } catch (e) {
      console.error("[PetEditPage] erro:", e);
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    
    if (petId) {
      navigate(`/pets/${petId}`);
      return;
    }
    navigate(-1);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Pet</h1>
          <p className="text-sm text-gray-600">ID: #{petId || "—"}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Voltar
        </button>
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          Carregando...
        </div>
      )}

      {!loading && error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && pet && (
        <PetForm
          mode="edit"
          initial={pet as any}
          submitting={submitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
