import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Pet } from "../../../models/pet";
import type { Tutor } from "../../../models/tutor";
import { petsService } from "../../../services/petsService";
import { tutoresService } from "../../../services/tutoresService";

export function PetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imgError, setImgError] = useState(false);

  const petId = useMemo(() => (id ? String(id) : ""), [id]);

  function pickFirstTruthy(...vals: any[]) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  }

  function extractEmbeddedTutor(p: any): Tutor | null {
    const t = p?.tutor ?? p?.tutorInfo ?? p?.responsavel ?? p?.dono ?? p?.owner ?? null;
    if (!t || typeof t !== "object") return null;

    const hasUseful =
      t?.id != null ||
      t?._id != null ||
      t?.nome != null ||
      t?.nomeCompleto != null ||
      t?.telefone != null ||
      t?.contato != null;

    if (!hasUseful) return null;
    return t as Tutor;
  }

  function extractTutorId(p: any): string | null {
    const direct = pickFirstTruthy(
      p?.tutorId,
      p?.tutor_id,
      p?.tutorID,
      p?.idTutor,
      p?.id_tutor,
      p?.tutor?.id,
      p?.tutor?._id,
      p?.tutor?.tutorId,
      p?.tutor?.tutor_id
    );

    if (direct != null) return String(direct);

    const rel = pickFirstTruthy(
      p?.tutores?.[0]?.id,
      p?.tutores?.[0]?._id,
      p?.tutoresIds?.[0],
      p?.tutores_ids?.[0],
      p?.tutorIds?.[0],
      p?.tutor_ids?.[0]
    );

    if (rel != null) return String(rel);
    return null;
  }

  // Foto
  function extractPhotoValue(p: any) {
    
    const direct = pickFirstTruthy(
      p?.fotoUrl,
      p?.foto_url,
      p?.urlFoto,
      p?.imagemUrl,
      p?.imagem_url
    );
    if (typeof direct === "string") return direct;

    
    if (typeof p?.foto === "string") return p.foto;

    
    const obj = p?.foto;
    if (obj && typeof obj === "object") {
      const fromObj = pickFirstTruthy(
        obj?.url,
        obj?.path,
        obj?.src,
        obj?.href,
        obj?.link,
        obj?.location,
        obj?.downloadUrl,
        obj?.fileUrl,
        obj?.imagemUrl,
        obj?.fotoUrl
      );
      if (typeof fromObj === "string") return fromObj;
    }

    
    const nested = pickFirstTruthy(p?.foto?.url, p?.foto?.path, p?.foto?.src);
    if (typeof nested === "string") return nested;

    return null;
  }
  
  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";

  function normalizeImageUrl(url: any) {
    if (!url) return null;
    const s = String(url);

  
    if (s.startsWith("http://") || s.startsWith("https://")) return s;

  
    try {
      const origin = new URL(API_BASE).origin;

      if (s.startsWith("/")) return `${origin}${s}`;
      return `${origin}/${s}`;
    } catch {
      if (!API_BASE) return s;
      return `${API_BASE.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
    }
  }
  

  function formatPhoneBR(value: any) {
    if (value == null) return "—";
    const original = String(value);
    const digits = original.replace(/\D/g, "");

    if (digits.length === 11) {
      const ddd = digits.slice(0, 2);
      const a = digits.slice(2, 7);
      const b = digits.slice(7, 11);
      return `(${ddd})${a}-${b}`;
    }

    if (digits.length === 10) {
      const ddd = digits.slice(0, 2);
      const a = digits.slice(2, 6);
      const b = digits.slice(6, 10);
      return `(${ddd})${a}-${b}`;
    }

    return original;
  }

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);
        setTutor(null);
        setPet(null);
        setImgError(false);

        if (!petId) {
          setError("ID do pet não informado.");
          return;
        }

        const p = await petsService.byId(petId);
        setPet(p);

        const embedded = extractEmbeddedTutor(p as any);
        if (embedded) {
          setTutor(embedded);
          return;
        }

        const tutorId = extractTutorId(p as any);

        if (tutorId) {
          const t = await tutoresService.byId(String(tutorId));
          setTutor(t);
        } else {
          setTutor(null);
        }
      } catch (err) {
        console.error("[PetDetailsPage] erro ao carregar:", err);
        setError("Não foi possível carregar os detalhes do pet.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [petId]);

  const nome = (pet as any)?.nome ?? "Sem nome";
  const especie = (pet as any)?.especie ?? (pet as any)?.tipo ?? "—";
  const raca = (pet as any)?.raca ?? "—";
  const idade = (pet as any)?.idade ?? (pet as any)?.idadeEmAnos ?? (pet as any)?.anos ?? "—";

  
  const fotoUrlRaw = extractPhotoValue(pet as any);
  const fotoUrl = normalizeImageUrl(fotoUrlRaw);

  const tutorNome =
    (tutor as any)?.nomeCompleto ??
    (tutor as any)?.nome ??
    (tutor as any)?.nome_completo ??
    "—";

  const tutorContatoRaw =
    (tutor as any)?.telefone ??
    (tutor as any)?.contato ??
    (tutor as any)?.phone ??
    "—";

  const tutorContato = formatPhoneBR(tutorContatoRaw);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Detalhes do Pet{" "}
            <span className="text-base font-normal text-gray-500">#{petId || "—"}</span>
          </h1>
          <p className="text-sm text-gray-600">Informações completas</p>
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && pet && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="rounded-xl border bg-white p-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
              {fotoUrl && !imgError ? (
                <img
                  src={String(fotoUrl)}
                  alt={String(nome)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  Sem foto
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold">{nome}</p>
              <p className="mt-1 text-sm text-gray-600">
                {especie} • {raca}
              </p>
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Idade:</span> {String(idade)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-lg font-semibold">Dados do Pet</p>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Nome</span>
                  <span className="font-medium">{nome}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Espécie</span>
                  <span className="font-medium">{String(especie)}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Raça</span>
                  <span className="font-medium">{String(raca)}</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Idade</span>
                  <span className="font-medium">{String(idade)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <p className="text-lg font-semibold">Tutor</p>

              {!tutor ? (
                <p className="mt-2 text-sm text-gray-600">Nenhum tutor vinculado.</p>
              ) : (
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Nome</span>
                    <span className="font-medium">{String(tutorNome)}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">Contato</span>
                    <span className="font-medium">{String(tutorContato)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
