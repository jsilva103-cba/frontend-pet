/**
 * Centraliza string
 */
export const API = {
  auth: {
    login: "/autenticacao/login",
    refresh: "/autenticacao/refresh",
  },
  pets: {
    list: "/v1/pets",
    byId: (id: string) => `/v1/pets/${id}`,
    uploadFoto: (id: string) => `/v1/pets/${id}/fotos`,
  },
  tutores: {
    create: "/v1/tutores",
    byId: (id: string) => `/v1/tutores/${id}`,
    uploadFoto: (id: string) => `/v1/tutores/${id}/fotos`,
    vincularPet: (tutorId: string, petId: string) =>
      `/v1/tutores/${tutorId}/pets/${petId}`,
  },
} as const;
