import { useEffect, useState } from "react";
import type { Pet } from "../../models/pet";
import { petsService } from "../../services/petsService";

/**
 Lista Pets
 */
export function PetsPage() {
  const [items, setItems] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);

      const data = await petsService.list();
      setItems(data);
    } catch (err) {
      console.error("[PetsPage] erro ao buscar pets:", err);
      setError("Não foi possível carregar a lista de pets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pets</h1>
          <p className="text-sm text-gray-600">Listagem API</p>
        </div>

        <button
          onClick={load}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Recarregar
        </button>
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          Carregando...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          Nenhum pet encontrado.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((p: any, idx) => (
            <li key={p?.id ?? idx} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{p?.nome ?? "Sem nome"}</p>
                  <p className="text-sm text-gray-600">
                    {p?.especie ?? p?.tipo ?? "—"} • {p?.raca ?? "—"}
                  </p>
                </div>

                {p?.id && (
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    #{p.id}
                  </span>
                )}
              </div>
        
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
