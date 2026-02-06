import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Tutor } from "../../../models/tutor";
import { tutoresService } from "../../../services/tutoresService";
import { petsService } from "../../../services/petsService";


/**
 * Remove qualquer caractere que nao seja digito.
 */
function digitsOnly(v: any) {
  return String(v ?? "").replace(/\D/g, "");
}


/**
 * Formata telefone.
 */
function formatPhoneBR(value: any) {
  const d = digitsOnly(value);
  if (d.length === 11) return `(${d.slice(0, 2)})${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)})${d.slice(2, 6)}-${d.slice(6)}`;
  return String(value ?? "—");
}

export function TutorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const tutorId = useMemo(() => (id ? String(id) : ""), [id]);
  const navigate = useNavigate();

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [petToLink, setPetToLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function extractPetsFromTutor(t: any): any[] {
    const arr =
      t?.pets ??
      t?.animais ??
      t?.petList ??
      t?.petsVinculados ??
      t?.vinculos ??
      t?.petsIds ??
      null;

    if (Array.isArray(arr)) return arr;
    return [];
  }

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

     
      const embeddedPets = extractPetsFromTutor(t as any);

      
      const hasOnlyIds =
        embeddedPets.length > 0 &&
        embeddedPets.every((x) => typeof x === "string" || typeof x === "number");

      if (hasOnlyIds) {
        const { items } = await petsService.list({ page: 1, size: 500, search: "" });
        const ids = embeddedPets.map((x) => String(x));
        const resolved = items.filter((p: any) =>
          ids.includes(String(p?.id ?? p?._id ?? ""))
        );
        setPets(resolved);
      } else {
        setPets(embeddedPets);
      }
    } catch (e) {
      console.error("[TutorDetailsPage] erro:", e);
      setError("Não foi possível carregar os detalhes do tutor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    
  }, [tutorId]);

  const nome =
    (tutor as any)?.nomeCompleto ?? (tutor as any)?.nome ?? "—";
  const telefone =
    (tutor as any)?.telefone ?? (tutor as any)?.contato ?? "—";
  const endereco = (tutor as any)?.endereco ?? "—";

  async function handleDelete() {
    if (!tutorId) return;
    const ok = window.confirm("Tem certeza que deseja excluir este tutor?");
    if (!ok) return;

    try {
      setBusy(true);
      await tutoresService.remove(tutorId);
      navigate("/tutores");
    } catch (e) {
      console.error("[TutorDetailsPage] erro ao excluir:", e);
      setError("Não foi possível excluir o tutor.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVincular() {
    const petId = petToLink.trim();
    if (!tutorId || !petId) return;

    try {
      setBusy(true);
      await tutoresService.vincularPet(tutorId, petId);
      setPetToLink("");
      await load();
    } catch (e) {
      console.error("[TutorDetailsPage] erro ao vincular:", e);
      setError("Não foi possível vincular o pet.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDesvincular(p: any) {
    const petId = String(p?.id ?? p?._id ?? p);
    if (!tutorId || !petId) return;

    const ok = window.confirm("Remover vínculo deste pet?");
    if (!ok) return;

    try {
      setBusy(true);
      await tutoresService.desvincularPet(tutorId, petId);
      await load();
    } catch (e) {
      console.error("[TutorDetailsPage] erro ao desvincular:", e);
      setError("Não foi possível remover o vínculo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Detalhes do Tutor{" "}
            <span className="text-base font-normal text-gray-500">#{tutorId || "—"}</span>
          </h1>
          <p className="text-sm text-gray-600">Informações completas</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/tutores/${tutorId}/editar`)}
            disabled={!tutorId || busy}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            Editar
          </button>

          <button
            onClick={handleDelete}
            disabled={!tutorId || busy}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
          >
            Excluir
          </button>

          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Voltar
          </button>
        </div>
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
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-lg font-semibold">Dados do Tutor</p>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Nome</span>
                <span className="font-medium">{String(nome)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Telefone</span>
                <span className="font-medium">{formatPhoneBR(telefone)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Endereço</span>
                <span className="font-medium">{String(endereco)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-semibold">Pets vinculados</p>

              <div className="flex gap-2">
                <input
                  value={petToLink}
                  onChange={(e) => setPetToLink(e.target.value)}
                  placeholder="PetId para vincular (ex: 123)"
                  className="w-64 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
                />
                <button
                  onClick={handleVincular}
                  disabled={busy || !petToLink.trim()}
                  className="rounded-lg border bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  Vincular
                </button>
              </div>
            </div>

            <div className="mt-3">
              {pets.length === 0 ? (
                <p className="text-sm text-gray-600">Nenhum pet vinculado.</p>
              ) : (
                <ul className="grid gap-2">
                  {pets.map((p: any, idx) => {
                    const idKey = p?.id ?? p?._id ?? p ?? idx;
                    const nomePet = p?.nome ?? String(p ?? "Pet");
                    return (
                      <li
                        key={String(idKey)}
                        className="flex items-center justify-between rounded-lg border bg-white p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{nomePet}</p>
                          <p className="text-xs text-gray-600">
                            ID: {String(p?.id ?? p?._id ?? p ?? "—")}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDesvincular(p)}
                          disabled={busy}
                          className="rounded-lg border bg-white px-3 py-2 text-xs font-medium hover:bg-gray-50 disabled:opacity-60"
                        >
                          Remover vínculo
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
