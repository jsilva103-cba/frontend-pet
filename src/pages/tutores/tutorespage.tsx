import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tutor } from "../../models/tutor";
import { formatPhoneBR, tutoresService } from "../../services/tutoresService";

export function TutoresPage() {
  const navigate = useNavigate();

  const PAGE_SIZE = 10;

  const [items, setItems] = useState<Tutor[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  async function load(p = page, s = debouncedSearch) {
    try {
      setError(null);
      setLoading(true);

      const result = await tutoresService.list({
        page: p,
        size: PAGE_SIZE,
        search: s,
      });

      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error("[TutoresPage] erro ao buscar tutores:", err);
      setError("Não foi possível carregar a lista de tutores.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    void load(page, debouncedSearch);
  }, [page, debouncedSearch]);

  const totalPages = useMemo(() => {
    const n = Math.ceil((total || 0) / PAGE_SIZE);
    return Math.max(1, n);
  }, [total]);

  const hasItems = items.length > 0;

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 resultados";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `${start}–${end} de ${total}`;
  }, [page, total]);

  function goToDetails(t: any) {
    const id = t?.id ?? t?._id;
    if (id == null) return;
    navigate(`/tutores/${String(id)}`);
  }

  return (
    <div className="mx-auto max-w-5xl p-6" aria-busy={loading}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutores</h1>
          <p className="text-sm text-gray-600">Listagem API • {rangeLabel}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome…"
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring sm:w-72"
          />

          <button
            onClick={() => load(page, debouncedSearch)}
            disabled={loading}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Carregando..." : "Recarregar"}
          </button>

          <button
            onClick={() => navigate("/tutores/novo")}
            className="rounded-lg border bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Novo Tutor
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={loading || page <= 1}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          ← Anterior
        </button>

        <div className="text-sm text-gray-600">
          Página <span className="font-medium text-gray-900">{page}</span> de{" "}
          <span className="font-medium text-gray-900">{totalPages}</span>
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={loading || page >= totalPages}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          Próxima →
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

      {!loading && !error && !hasItems && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          Nenhum tutor encontrado.
        </div>
      )}

      {!loading && !error && hasItems && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((t: any, idx) => {
            const idKey = t?.id ?? t?._id ?? `${t?.nomeCompleto ?? "tutor"}-${idx}`;
            const nome =
              t?.nomeCompleto ?? t?.nome ?? t?.nome_completo ?? "Sem nome";
            const contato =
              t?.telefone ?? t?.contato ?? t?.phone ?? "—";

            return (
              <li key={String(idKey)}>
                <button
                  type="button"
                  onClick={() => goToDetails(t)}
                  className="w-full rounded-xl border bg-white p-4 text-left transition hover:bg-gray-50 focus:outline-none focus:ring"
                >
                  <p className="truncate text-lg font-semibold">{String(nome)}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Contato: {formatPhoneBR(contato)}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Clique para ver detalhes →
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            ← Anterior
          </button>

          <div className="text-sm text-gray-600">{rangeLabel}</div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
