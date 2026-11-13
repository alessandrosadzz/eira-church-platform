// src/types/evento.ts

export type CategoriaEvento =
  | 'Hype'
  | 'One Way'
  | 'Padrão'
  | 'Encontro'
  | 'Acampamento'
  | 'Conferência'
  | 'Culto especial'
  | 'Outro';

export type CampoDisponivel =
  | 'nome'
  | 'email'
  | 'telefone'
  | 'nascimento'
  | 'nome_responsavel'
  | 'telefone_responsavel'
  | 'email_responsavel'
  | 'observacoes_saude'
  | 'igreja'
  | 'transporte'
  | 'participa_celula'
  | 'nome_celula_lider';

export interface Evento {
  id: string;
  igreja_id?: string;
  slug: string;
  nome: string;
  descricao?: string | null;
  data_inicio: string;
  data_fim?: string | null;
  vagas: number;
  valor: number;
  categoria: CategoriaEvento;
  rede: 'Hype' | 'One Way' | 'Padrão';
  campos: CampoDisponivel[];
  ativo: boolean;
  imagem_url?: string | null;
  local_nome?: string;
  created_at: string;
  updated_at: string;
  // Campos calculados da view eventos_com_contagem
  total_inscritos?: number;
  inscritos_confirmados?: number;
  vagas_restantes?: number;
  receita_confirmada?: number;
}
