
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { petsService } from "../../../services/petsService";

export function PetCreatePage() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState("");
  const [idade, setIdade] = useState<string>("");
  const [raca, setRaca] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const idadeNum = Number(idade);
    return (
      nome.trim().length >= 2 &&
      especie.trim().length >= 2 &&
      raca.trim().length >= 2 &&
      Number.isFinite(idadeNum) &&
      idadeNum >= 0
    );
  }, [nome, especie, idade, raca]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      const created = await petsService.create({
        nome: nome.trim(),
        especie: especie.trim(),
        idade: Number(idade),
        raca: raca.trim(),
      });

      const createdId = String((created as any)?.id ?? (created as any)?._id ?? "");

      if (foto && createdId) {
        try {
          await petsService.uploadFoto(createdId, foto);
        } catch (uploadErr) {
          console.warn("[PetCreatePage] erro no upload da foto:", uploadErr);
         
        }
      }

      if (createdId) {
        navigate(`/pets/${createdId}`);
      } else {
        navigate("/pets");
      }
    } catch (err) {
      console.error("[PetCreatePage] erro ao criar pet:", err);
      setError("Não foi possível cadastrar o pet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Novo Pet</h1>
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

      <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
              placeholder="Ex: Mel"
              autoFocus
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Espécie</span>
            <input
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
              placeholder="Ex: Cachorro"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Idade</span>
            <input
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
              placeholder="Ex: 2"
              inputMode="numeric"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Raça</span>
            <input
              value={raca}
              onChange={(e) => setRaca(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring"
              placeholder="Ex: Pitbull"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm text-gray-700">Foto (opcional)</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="rounded-lg border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/pets")}
            className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="rounded-lg border bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
