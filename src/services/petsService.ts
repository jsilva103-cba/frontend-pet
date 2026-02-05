// src/services/petsService.ts
import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { Pet } from "../models/pet";

export type PetsListResult = {
  items: Pet[];
  total: number;
};

export type PetsListParams = {
  page?: number; // 1-based na UI
  size?: number; // itens por página
  search?: string; // busca por nome
};

function normalizeArrayResponse(
  data: any,
  page: number,
  size: number,
  search: string
): PetsListResult {
  const all: any[] = Array.isArray(data) ? data : [];

  const term = search.trim().toLowerCase();
  const filtered = term
    ? all.filter((p) => String(p?.nome ?? "").toLowerCase().includes(term))
    : all;

  const total = filtered.length;

  const start = (page - 1) * size;
  const end = start + size;
  const items = filtered.slice(start, end) as Pet[];

  return { items, total };
}

function normalizeObjectResponse(data: any): PetsListResult {
  const items =
    (data?.items ??
      data?.content ??
      data?.data ??
      data?.results ??
      data?.pets ??
      []) as Pet[];

  const total =
    Number(
      data?.total ??
        data?.totalElements ??
        data?.totalItems ??
        data?.count ??
        data?.meta?.total
    ) || (Array.isArray(items) ? items.length : 0);

  return { items: Array.isArray(items) ? items : [], total };
}

export type PetUpsertPayload = {
  nome: string;
  especie: string;
  idade: number;
  raca: string;
  [key: string]: any;
};

function buildUpsertBody(payload: PetUpsertPayload) {
  const nome = String(payload?.nome ?? "").trim();
  const especie = String(payload?.especie ?? "").trim(); // UI usa "especie"
  const idade = Number(payload?.idade ?? 0);
  const raca = String(payload?.raca ?? "").trim();

  // A API pode aceitar "tipo" (além de "especie"). Enviamos ambos.
  // IMPORTANTE: não duplica chaves com spread (evita warning TS).
  const extras: any = { ...payload };
  delete extras.nome;
  delete extras.especie;
  delete extras.idade;
  delete extras.raca;
  delete extras.tipo;

  const body: any = {
    ...extras,
    nome,
    idade,
    raca,
    especie,
    tipo: especie,
  };

  if (!body.tipo && body.especie) body.tipo = body.especie;
  if (!body.especie && body.tipo) body.especie = body.tipo;

  return body;
}

export const petsService = {
  async list(params?: PetsListParams): Promise<PetsListResult> {
    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const search = params?.search ?? "";

    const { data } = await httpClient.get(API.pets.list, {
      params: {
        page,
        size,
        nome: search || undefined,
        search: search || undefined,
        q: search || undefined,
      },
    });

    if (Array.isArray(data)) {
      return normalizeArrayResponse(data, page, size, search);
    }

    return normalizeObjectResponse(data);
  },

  async byId(id: string): Promise<Pet> {
    const { data } = await httpClient.get(API.pets.byId(id));
    return data as Pet;
  },

  async create(payload: PetUpsertPayload): Promise<Pet> {
    const body = buildUpsertBody(payload);
    const { data } = await httpClient.post(API.pets.create, body);
    return data as Pet;
  },

  async update(id: string, payload: PetUpsertPayload): Promise<Pet> {
    const body = buildUpsertBody(payload);
    const { data } = await httpClient.put(API.pets.update(id), body);
    return data as Pet;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.pets.remove(id));
  },

  async uploadFoto(id: string, file: File): Promise<any> {
    const form = new FormData();

    // alguns backends esperam nomes diferentes -> enviamos o mesmo arquivo em chaves comuns
    form.append("file", file, file.name);
    form.append("foto", file, file.name);
    form.append("imagem", file, file.name);

    // NÃO setar Content-Type manualmente (o axios seta o boundary corretamente)
    const { data } = await httpClient.post(API.pets.uploadFoto(id), form);

    return data;
  },
};
