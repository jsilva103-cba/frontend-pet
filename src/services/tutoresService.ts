import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { Tutor } from "../models/tutor";

export type TutoresListResult = {
  items: Tutor[];
  total: number;
};

export type TutoresListParams = {
  page?: number; 
  size?: number; 
  search?: string; 
};

export type TutorUpsertPayload = {
  nomeCompleto: string;
  telefone: string;
  endereco: string;
  [key: string]: any;
};

function normalizeText(v: any): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tutorSearchField(t: any): string {
  const nome =
    t?.nomeCompleto ??
    t?.nome_completo ??
    t?.nome ??
    t?.nomeTutor ??
    "";
  return normalizeText(nome);
}

function filterTutors(all: any[], search: string): any[] {
  const term = normalizeText(search);
  if (!term) return all;
  return all.filter((t) => tutorSearchField(t).includes(term));
}

function normalizeArrayResponse(
  data: any,
  page: number,
  size: number,
  search: string
): TutoresListResult {
  const all: any[] = Array.isArray(data) ? data : [];
  const filtered = filterTutors(all, search);

  const total = filtered.length;

  const start = (page - 1) * size;
  const end = start + size;
  const items = filtered.slice(start, end) as Tutor[];

  return { items, total };
}

function normalizeObjectResponse(data: any): TutoresListResult {
  const items =
    (data?.items ??
      data?.content ??
      data?.data ??
      data?.results ??
      data?.tutores ??
      []) as Tutor[];

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

function onlyDigits(v: any) {
  return String(v ?? "").replace(/\D/g, "");
}

export function formatPhoneBR(value: any) {
  if (value == null) return "—";
  const original = String(value);
  const digits = onlyDigits(original);

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

async function fetchAllTutors(): Promise<Tutor[]> {
  
  const tryPages = [0, 1]; 

  for (const startPage of tryPages) {
    const acc: Tutor[] = [];
    const seen = new Set<string>();

    
    const firstResp = await httpClient.get(API.tutores.list, {
      params: { page: startPage, size: 200 },
    });

    const firstData = firstResp.data;

    if (Array.isArray(firstData)) {
       return firstData as Tutor[];
    }

    const first = normalizeObjectResponse(firstData);

    
    if (first.items.length === 0 && first.total === 0) continue;

    const pushUnique = (arr: Tutor[]) => {
      for (const t of arr) {
        const id = String((t as any)?.id ?? (t as any)?._id ?? "");
        const key = id || JSON.stringify(t);
        if (seen.has(key)) continue;
        seen.add(key);
        acc.push(t);
      }
    };

    pushUnique(first.items);

    const total = first.total || first.items.length;

   
    if (acc.length >= total) return acc;

   
    const MAX_PAGES = 50;

    for (let i = 1; i < MAX_PAGES; i++) {
      const nextPage = startPage + i;

      const resp = await httpClient.get(API.tutores.list, {
        params: { page: nextPage, size: 200 },
      });

      const data = resp.data;

      if (Array.isArray(data)) {
       
        return data as Tutor[];
      }

      const chunk = normalizeObjectResponse(data);
      if (chunk.items.length === 0) break;

      pushUnique(chunk.items);

      if (acc.length >= total) return acc;
    }
    
    if (acc.length > 0) return acc;
  }

  return [];
}

export const tutoresService = {
  async list(params?: TutoresListParams): Promise<TutoresListResult> {
    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const search = params?.search ?? "";

       const { data } = await httpClient.get(API.tutores.list, {
      params: {
        page,
        size,
        nome: search || undefined,
        nomeCompleto: search || undefined,
        search: search || undefined,
        q: search || undefined,
      },
    });

    
    if (Array.isArray(data)) {
      return normalizeArrayResponse(data, page, size, search);
    }

    
    const first = normalizeObjectResponse(data);

    
    if (search.trim() && first.items.length === 0) {
      const all = await fetchAllTutors();
      return normalizeArrayResponse(all, page, size, search);
    }

    return first;
  },

  async byId(id: string): Promise<Tutor> {
    const { data } = await httpClient.get(API.tutores.byId(id));
    return data as Tutor;
  },

  async create(payload: TutorUpsertPayload): Promise<Tutor> {
    const body: any = {
      ...payload,
      nomeCompleto: String(payload?.nomeCompleto ?? "").trim(),
      nome: String(payload?.nomeCompleto ?? "").trim(),
      telefone: String(payload?.telefone ?? "").trim(),
      contato: String(payload?.telefone ?? "").trim(),
      endereco: String(payload?.endereco ?? "").trim(),
    };

    const { data } = await httpClient.post(API.tutores.create, body);
    return data as Tutor;
  },

  async update(id: string, payload: TutorUpsertPayload): Promise<Tutor> {
    const body: any = {
      ...payload,
      nomeCompleto: String(payload?.nomeCompleto ?? "").trim(),
      nome: String(payload?.nomeCompleto ?? "").trim(),
      telefone: String(payload?.telefone ?? "").trim(),
      contato: String(payload?.telefone ?? "").trim(),
      endereco: String(payload?.endereco ?? "").trim(),
    };

    const { data } = await httpClient.put(API.tutores.update(id), body);
    return data as Tutor;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.tutores.remove(id));
  },

  async uploadFoto(id: string, file: File): Promise<any> {
    const form = new FormData();
    form.append("file", file);

    const { data } = await httpClient.post(API.tutores.uploadFoto(id), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  async vincularPet(tutorId: string, petId: string): Promise<any> {
    const { data } = await httpClient.post(
      API.tutores.vincularPet(tutorId, petId)
    );
    return data;
  },

  async desvincularPet(tutorId: string, petId: string): Promise<any> {
    const { data } = await httpClient.delete(
      API.tutores.desvincularPet(tutorId, petId)
    );
    return data;
  },
};
