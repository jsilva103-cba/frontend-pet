import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Pet } from "../../models/pet";
import { petsService } from "../../services/petsService";

/**
 * Lista Pets 
 */
export function PetsPage() {
  const navigate = useNavigate();

  const PAGE_SIZE = 10;

  const [items, setItems] = useState<Pet[]>([]);
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

  // ---- BUSCA (FIX) -------------------------------------------------
  function normalizeText(v: any): string {
    return String(v ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function petSearchField(p: any): string {
    const nome = p?.nome ?? p?.nomePet ?? p?.petNome ?? p?.name ?? "";
    return normalizeText(nome);
  }
 
  async function load(p = page, s = debouncedSearch) {
    try {
      setError(null);
      setLoading(true);

      const result = await petsService.list({
        page: p,
        size: PAGE_SIZE,
        search: s,
      });


      const term = normalizeText(s);
      if (term && (result.items.length === 0 || result.total > 0)) {
             const all = await petsService.list({
          page: 1,
          size: 1000,
          search: "",
        });

        const filteredAll = (all.items as any[]).filter((pet) =>
          petSearchField(pet).includes(term)
        );

        const totalLocal = filteredAll.length;
        const start = (p - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageItems = filteredAll.slice(start, end) as Pet[];

        setItems(pageItems);
        setTotal(totalLocal);
        return;
      }
      // -----------------------------------------------------------------

      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error("[PetsPage] erro ao buscar pets:", err);
      setError("Não foi possível carregar a lista de pets.");
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

  function goToDetails(p: any) {
    const id = p?.id ?? p?._id;
    if (id == null) return;
    navigate(`/pets/${String(id)}`);
  }

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

  function normalizeImageUrl(url: any) {
    if (!url) return null;
    const s = String(url);

    if (s.startsWith("http://") || s.startsWith("https://")) return s;

    if (!API_BASE) return s;
    return `${API_BASE.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
  }

  function resolvePetImage(p: any) {
    const direct =
      p?.fotoUrl ??
      p?.foto_url ??
      p?.urlFoto ??
      p?.imagemUrl ??
      p?.imagem_url ??
      p?.foto?.url ??
      p?.foto?.path ??
      null;

    const fromArray =
      Array.isArray(p?.fotos) && p.fotos.length > 0
        ? p.fotos[0]?.url ??
          p.fotos[0]?.path ??
          p.fotos[0]?.fotoUrl ??
          p.fotos[0]
        : null;

    const maybe = direct ?? fromArray ?? p?.foto ?? p?.fotoId ?? p?.idFoto ?? null;

    return normalizeImageUrl(maybe);
  }

  return (
    <div className="mx-auto max-w-5xl p-6" aria-busy={loading}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pets</h1>
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
            onClick={() => navigate("/pets/novo")}
            className="rounded-lg border bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Novo Pet
          </button>
        </div>
      </div>

      {/* Paginação (topo) */}
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
        <div className="rounded-lg border bg-white p-4 text-gray-600">Carregando...</div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && !hasItems && (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          Nenhum pet encontrado.
        </div>
      )}

      {!loading && !error && hasItems && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((p: any, idx) => {
            const idKey = p?.id ?? p?._id ?? `${p?.nome ?? "pet"}-${idx}`;
            const nome = p?.nome ?? "Sem nome";
            const especie = p?.especie ?? p?.tipo ?? "—";
            const idade = p?.idade ?? p?.idadeEmAnos ?? p?.anos ?? "—";

            const fotoUrl = resolvePetImage(p);

            return (
              <li key={String(idKey)}>
                <button
                  type="button"
                  onClick={() => goToDetails(p)}
                  className="w-full rounded-xl border bg-white p-4 text-left transition hover:bg-gray-50 focus:outline-none focus:ring"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {fotoUrl ? (
                        <img
                          src={String(fotoUrl)}
                          alt={String(nome)}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fb = e.currentTarget.parentElement?.querySelector(
                              '[data-fallback="1"]'
                            ) as HTMLElement | null;
                            if (fb) fb.style.display = "flex";
                          }}
                        />
                      ) : null}

                      <div
                        data-fallback="1"
                        style={{ display: fotoUrl ? "none" : "flex" }}
                        className="h-full w-full items-center justify-center text-xs text-gray-500"
                      >
                        Sem foto
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold">{nome}</p>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {String(especie)} • Idade: {String(idade)}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">Clique para ver detalhes →</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Paginação (rodapé) */}
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
