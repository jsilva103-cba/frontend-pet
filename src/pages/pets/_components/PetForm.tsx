import { useMemo, useState } from "react";
import type { Pet } from "../../../models/pet";
import type { PetUpsertPayload } from "../../../services/petsService";

type Props = {
  mode: "create" | "edit";
  initial?: Partial<Pet> | null;
  submitting?: boolean;
  onSubmit: (payload: PetUpsertPayload, photo?: File | null) => Promise<void>;
  onCancel: () => void;
};

function toNumberSafe(v: any): number {
  // somente dígitos
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function PetForm({
  mode,
  initial,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [nome, setNome] = useState(String((initial as any)?.nome ?? ""));
  const [especie, setEspecie] = useState(
    String((initial as any)?.especie ?? (initial as any)?.tipo ?? "")
  );
  const [idade, setIdade] = useState<number>(
    toNumberSafe((initial as any)?.idade ?? (initial as any)?.anos ?? 0)
  );
  const [raca, setRaca] = useState(String((initial as any)?.raca ?? ""));

  // foto up 
  const [photo, setPhoto] = useState<File | null>(null);


  const photoPreview = useMemo(() => {
    if (!photo) return null;
    return URL.createObjectURL(photo);
  }, [photo]);

  const canSubmit = useMemo(() => {
    return (
      nome.trim().length >= 2 &&
      especie.trim().length >= 2 &&
      raca.trim().length >= 1 &&
      Number.isFinite(idade) &&
      idade >= 0
    );
  }, [nome, especie, raca, idade]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    const payload: PetUpsertPayload = {
      nome: nome.trim(),
      especie: especie.trim(),
      idade: Number(idade),
      raca: raca.trim(),
    };

    await onSubmit(payload, photo);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Novo Pet" : "Editar Pet"}
        </h2>
        <p className="text-sm text-gray-600">
          Preencha os campos obrigatórios (nome, espécie, idade, raça).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: Mel"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Espécie</label>
          <input
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: Cachorro"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Idade</label>
          <input
            value={String(idade)}
            onChange={(e) => setIdade(toNumberSafe(e.target.value))}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: 2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Somente números (ex: 0, 1, 2…).
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Raça</label>
          <input
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: Pitbull"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Foto (opcional)
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm"
          />

          <p className="mt-1 text-xs text-gray-500">
            Se selecionar uma foto, faremos upload após salvar.
          </p>

          {photoPreview && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-600">Pré-visualização:</p>
              <div className="mt-2 h-32 w-32 overflow-hidden rounded-lg border bg-gray-100">
                <img
                  src={photoPreview}
                  alt="Prévia da foto"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="rounded-lg border bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting
            ? "Salvando..."
            : mode === "create"
            ? "Criar Pet"
            : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
