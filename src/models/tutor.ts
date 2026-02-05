export type Tutor = {
  id?: string | number;
  nome?: string;
  nomeCompleto?: string;
  telefone?: string;
  contato?: string;
  endereco?: string;
  fotoUrl?: string;

  pets?: Array<{
    id?: string | number;
    nome?: string;
  }>;

  [key: string]: any;
};
