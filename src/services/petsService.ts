import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { Pet } from "../models/pet";

/**
 * Servicp pets - chamadas api
 */
export const petsService = {
  async list(): Promise<Pet[]> {
    const { data } = await httpClient.get(API.pets.list);
    return Array.isArray(data) ? data : (data?.items ?? []);
  },
};
