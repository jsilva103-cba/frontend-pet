import { httpClient } from "./httpClient";
import { API } from "../config/api";
import type { Tutor } from "../models/tutor";

export const tutoresService = {
  async byId(id: string): Promise<Tutor> {
    const { data } = await httpClient.get(API.tutores.byId(id));
    return data as Tutor;
  },
};
