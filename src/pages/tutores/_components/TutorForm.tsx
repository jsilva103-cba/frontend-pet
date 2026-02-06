import { useMemo, useState } from "react";
import type { Tutor } from "../../../models/tutor";
import type { TutorUpsertPayload } from "../../../services/tutoresService";

type Props = {
  mode: "create" | "edit";
  initial?: Partial<Tutor> | null;
  submitting?: boolean;
  onSubmit: (payload: TutorUpsertPayload) => Promise<void>;
  onCancel: () => void;
};

function digitsOnly(v: any) {
  return String(v ?? "").replace(/\D/g, "");
}

//(00)00000-0000
function maskPhoneBR(value: any) {
  const d = digitsOnly(value).slice(0, 11);

  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)})${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)})${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)})${d.slice(2, 7)}-${d.slice(7)}`;
}

export function TutorForm({
  mode,
  initial,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [nomeCompleto, setNomeCompleto] = useState(
    String((initial as any)?.nomeCompleto ?? (initial as any)?.nome ?? "")
  );

  const [telefone, setTelefone] = useState(
    maskPhoneBR((initial as any)?.telefone ?? (initial as any)?.contato ?? "")
  );

  const [endereco, setEndereco] = useState(
    String((initial as any)?.endereco ?? "")
  );

  const telefoneDigits = useMemo(() => digitsOnly(telefone), [telefone]);

  const canSubmit = useMemo(() => {
    // 10 (fixo) ou 11 (celular)
    const phoneOk = telefoneDigits.length === 10 || telefoneDigits.length === 11;

    return (
      nomeCompleto.trim().length >= 2 &&
      endereco.trim().length >= 3 &&
      phoneOk
    );
  }, [nomeCompleto, endereco, telefoneDigits]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    const payload: TutorUpsertPayload = {
      nomeCompleto: nomeCompleto.trim(),
      telefone: telefoneDigits, // envia LIMPO pro backend
      endereco: endereco.trim(),
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "Novo Tutor" : "Editar Tutor"}
        </h2>
        <p className="text-sm text-gray-600">
          Campos obrigatórios: nome completo, telefone e endereço.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Nome completo</label>
          <input
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: Alexandre Araújo"
            autoFocus={mode === "create"}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(maskPhoneBR(e.target.value))}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="(00)00000-0000"
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-gray-500">Máscara: (00)00000-0000</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Endereço</label>
          <input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring"
            placeholder="Ex: Rua B, bloco 2"
          />
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
            ? "Criar Tutor"
            : "Salvar Alterações"}
        </button>
      </div>
    </form>
  );
}
