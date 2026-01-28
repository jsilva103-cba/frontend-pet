export type Pet = {
  id: string;
  nome: string;
  especie: string;
  idade: number;
  raca?: string | null;
  fotoUrl?: string | null;
  tutorId?: string | null;
};
