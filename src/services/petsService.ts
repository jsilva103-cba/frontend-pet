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
};
