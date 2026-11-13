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

export type UsuarioRole = 'admin' | 'pastor' | 'lider_12' | 'lider_celula' | 'lider';

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
  faviconUrl?: string;
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
  facebook?: string;
  youtube?: string;
  site?: string;
  email: string;
  chavePix?: string;
  copiaEColaPix?: string;
  titularPix?: string;
  cidadePix?: string;
  qrCodePixUrl?: string;
}

export interface VisitanteConexao {
  id: string;
  nome: string;
  sexo: 'Homem' | 'Mulher' | 'Casal';
  telefone: string;
  culto_origem?: 'Culto de Domingo (Adultos/Família)' | 'One Way (Jovens)' | 'Hype (Teens)' | 'Outro';
  bairro: string;
  endereco?: string;
  maps_url?: string;
  quem_convidou: string;
  faixa_etaria: 'Criança' | 'Adolescente (12-17)' | 'Jovem (18-29)' | 'Adulto' | 'Melhor Idade';
  ja_participa_celula?: boolean;
  nome_celula_atual?: string;
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
  rede: 'Homens' | 'Mulheres' | 'Hype' | 'One Way' | 'Casais' | 'Família' | 'Adultos' | 'Geral';
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
  role?: UsuarioRole;
  criadoEm: string;
}
