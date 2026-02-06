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
    create: "/v1/pets",
    byId: (id: string) => `/v1/pets/${id}`,
    update: (id: string) => `/v1/pets/${id}`,
    remove: (id: string) => `/v1/pets/${id}`,
    uploadFoto: (id: string) => `/v1/pets/${id}/fotos`,
  },
  tutores: {
    list: "/v1/tutores",
    create: "/v1/tutores",
    byId: (id: string) => `/v1/tutores/${id}`,
    update: (id: string) => `/v1/tutores/${id}`,
    remove: (id: string) => `/v1/tutores/${id}`,
    uploadFoto: (id: string) => `/v1/tutores/${id}/fotos`,
    vincularPet: (tutorId: string, petId: string) =>
      `/v1/tutores/${tutorId}/pets/${petId}`,
    desvincularPet: (tutorId: string, petId: string) =>
      `/v1/tutores/${tutorId}/pets/${petId}`,
  },
} as const;
