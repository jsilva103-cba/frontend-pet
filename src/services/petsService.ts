// src/services/petsService.ts
import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { Pet } from "../models/pet";

export type PetsListResult = {
  items: Pet[];
  total: number;
};

export type PetsListParams = {
  page?: number; 
  size?: number; 
  search?: string; 
};

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

function filterPets(all: any[], search: string): any[] {
  const term = normalizeText(search);
  if (!term) return all;
  return all.filter((p) => petSearchField(p).includes(term));
}

function extractItemsFromAny(data: any): Pet[] {
  const items =
    (data?.items ??
      data?.content ??
      data?.data ??
      data?.results ??
      data?.pets ??
      []) as Pet[];
  return Array.isArray(items) ? items : [];
}

function extractTotalFromAny(data: any, itemsLenFallback: number): number {
  const total =
    Number(
      data?.total ??
        data?.totalElements ??
        data?.totalItems ??
        data?.count ??
        data?.meta?.total
    ) || 0;

  return total > 0 ? total : itemsLenFallback;
}

function normalizeArrayResponse(
  data: any,
  page: number,
  size: number,
  search: string
): PetsListResult {
  const all: any[] = Array.isArray(data) ? data : [];
  const filtered = filterPets(all, search);

  const total = filtered.length;
  const start = (page - 1) * size;
  const end = start + size;

  return { items: filtered.slice(start, end) as Pet[], total };
}

function normalizeObjectResponse(data: any): PetsListResult {
  const items = extractItemsFromAny(data);
  const total = extractTotalFromAny(data, items.length);
  return { items, total };
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
  const especie = String(payload?.especie ?? "").trim();
  const idade = Number(payload?.idade ?? 0);
  const raca = String(payload?.raca ?? "").trim();

  
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

function getIdKey(p: any) {
  return String(p?.id ?? p?._id ?? p?.petId ?? "");
}


let allPetsCache: { at: number; items: Pet[] } | null = null;
let allPetsInFlight: Promise<Pet[]> | null = null;
const ALL_CACHE_TTL_MS = 60_000;

async function fetchAllPetsNoSearch(): Promise<Pet[]> {

  if (allPetsCache && Date.now() - allPetsCache.at < ALL_CACHE_TTL_MS) {
    return allPetsCache.items;
  }


  if (allPetsInFlight) return allPetsInFlight;

  allPetsInFlight = (async () => {
    const pageSize = 100; 
    const maxPages = 300; 

    const acc: Pet[] = [];
    const seen = new Set<string>();

    
    for (const startPage of [1, 0]) {
      acc.length = 0;
      seen.clear();

      let lastBatchSignature = "";

      for (let i = 0; i < maxPages; i++) {
        const page = startPage + i;

        const { data } = await httpClient.get(API.pets.list, {
          params: {
            page,
            size: pageSize,
          },
        });

        
        if (Array.isArray(data)) {
          const arr = data as Pet[];
          allPetsCache = { at: Date.now(), items: arr };
          return arr;
        }

        const items = extractItemsFromAny(data);
        if (items.length === 0) break;

        
        const signature = items.map(getIdKey).join("|");
        if (signature && signature === lastBatchSignature) break;
        lastBatchSignature = signature;

        for (const p of items) {
          const key = getIdKey(p) || JSON.stringify(p);
          if (seen.has(key)) continue;
          seen.add(key);
          acc.push(p);
        }

        
        const totalPages =
          Number(data?.totalPages ?? data?.meta?.totalPages ?? 0) || 0;
        if (totalPages > 0) {
            const lastPageIndex = startPage === 0 ? totalPages - 1 : totalPages;
          if (page >= lastPageIndex) break;
        }
      }

      
      if (acc.length > 0) {
        allPetsCache = { at: Date.now(), items: acc.slice() };
        return allPetsCache.items;
      }
    }

    allPetsCache = { at: Date.now(), items: [] };
    return [];
  })();

  try {
    return await allPetsInFlight;
  } finally {
    allPetsInFlight = null;
  }
}

export const petsService = {
  async list(params?: PetsListParams): Promise<PetsListResult> {
    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const search = params?.search ?? "";

      if (search.trim()) {
      const all = await fetchAllPetsNoSearch();
      const filtered = filterPets(all as any[], search);

      const total = filtered.length;
      const start = (page - 1) * size;
      const end = start + size;

      return { items: filtered.slice(start, end) as Pet[], total };
    }

     const { data } = await httpClient.get(API.pets.list, {
      params: {
        page,
        size,
      },
    });

    if (Array.isArray(data)) {
      return normalizeArrayResponse(data, page, size, "");
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
    form.append("file", file, file.name);
    form.append("foto", file, file.name);
    form.append("imagem", file, file.name);

       const { data } = await httpClient.post(API.pets.uploadFoto(id), form);
    return data;
  },
};
