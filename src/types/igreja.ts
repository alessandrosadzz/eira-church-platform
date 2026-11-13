// src/types/igreja.ts

export type TemaWhiteLabel =
  | 'eira-signature'
  | 'solar-amber'
  | 'royal-cobalt'
  | 'emerald-life'
  | 'monochrome';

export type BordaPerfil = 'sharp' | 'balanced' | 'rounded';

export type FonteOpcao =
  | 'manrope'
  | 'inter'
  | 'plus-jakarta'
  | 'outfit'
  | 'dm-sans'
  | 'poppins';

export type ModoCor = 'light' | 'dark';

export type UsuarioRole = 'lider' | 'pastor' | 'admin';

export interface HorarioCulto {
  id: string;
  dia: string;
  horario: string;
  descricao: string;
}

export interface IgrejaConfig {
  nome: string;
  slogan: string;
  logoUrl?: string;
  bannerUrl?: string;
  endereco: {
    logradouro: string;
    bairro: string;
    cidade: string;
    cep: string;
    mapsUrl?: string;
  };
  cultos: HorarioCulto[];
  telefone: string;
  whatsapp: string;
  instagram: string;
  email: string;
}

export interface VisitanteConexao {
  id: string;
  nome: string;
  telefone: string;
  bairro: string;
  quem_convidou: string;
  faixa_etaria: 'Criança' | 'Adolescente (12-17)' | 'Jovem (18-29)' | 'Adulto' | 'Melhor Idade';
  quer_celula: boolean;
  pedido_oracao?: string;
  data_visita: string;
  status: 'novo' | 'em_contato' | 'integrado';
  observacoes?: string;
  cadastrado_por?: string;
}

export interface CelulaMembro {
  id: string;
  nome: string;
  telefone: string;
  tempo_celula: string; // 'Recém-chegado' | '3 meses' | '6 meses' | '1 ano+'
  batizado: boolean;
  funcao: 'Membro' | 'Líder' | 'Vice-líder' | 'Anfitrião' | 'Líder em Treinamento';
}

export interface Celula {
  id: string;
  nome: string;
  rede: 'Hype' | 'One Way' | 'Família' | 'Casais' | 'Adultos' | 'Geral';
  lider_nome: string;
  lider_telefone: string;
  vice_lider_nome?: string;
  anfitriao_nome?: string;
  dia_semana: string;
  horario: string;
  bairro: string;
  endereco: string;
  maps_url: string;
  membros: CelulaMembro[];
}

export interface LiderConta {
  id: string;
  nome: string;
  usuarioOuEmail: string;
  senha: string;
  telefone: string;
  celulaNome: string;
  rede: string;
  criadoEm: string;
}
