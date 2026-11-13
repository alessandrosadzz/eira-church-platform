// src/types/inscricao.ts

import { Evento } from './evento';

export type StatusInscricao = 'pendente' | 'pago' | 'isento';
export type MetodoPagamento = 'pix' | 'cartao' | 'boleto' | 'dinheiro' | 'balcao' | 'isento';

export interface Inscricao {
  id: string;
  evento_id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  nascimento?: string | null;
  idade?: number | null;
  is_menor?: boolean;
  nome_responsavel?: string | null;
  telefone_responsavel?: string | null;
  igreja?: string | null;
  transporte?: boolean;
  observacoes_saude?: string | null;
  participa_celula?: boolean;
  nome_celula_lider?: string | null;
  status: StatusInscricao;
  metodo_pag?: MetodoPagamento | null;
  mp_payment_id?: string | null;
  mp_preference_id?: string | null;
  comprovante_hash?: string;
  comprovante_url?: string | null;
  created_at: string;
  updated_at?: string;
  evento?: Pick<Evento, 'nome' | 'categoria' | 'rede' | 'valor'>;
}

export interface FiltrosInscricao {
  busca?: string;
  evento_id?: string;
  status?: StatusInscricao | 'todos';
  metodo_pag?: MetodoPagamento | 'todos';
}
