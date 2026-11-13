// src/store/adminStore.ts
import { create } from 'zustand';
import { Evento } from '../types/evento';
import { FiltrosInscricao } from '../types/inscricao';
import {
  TemaWhiteLabel,
  BordaPerfil,
  FonteOpcao,
  ModoCor,
  UsuarioRole,
  IgrejaConfig,
  VisitanteConexao,
  Celula,
  CelulaMembro,
} from '../types/igreja';

export type AbaAdmin =
  | 'dashboard'
  | 'conexao'
  | 'celulas'
  | 'inscricoes'
  | 'eventos'
  | 'novo-evento'
  | 'configuracao';

export type { TemaWhiteLabel, BordaPerfil, FonteOpcao, ModoCor, UsuarioRole, Celula, CelulaMembro };

const IGREJA_CONFIG_PADRAO: IgrejaConfig = {
  nome: 'Eira Church',
  slogan: 'Uma igreja viva, acolhedora e relevante em células',
  logoUrl: '',
  bannerUrl: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=1600&q=80',
  endereco: {
    logradouro: 'Av. Brasil, 4520',
    bairro: 'Centro',
    cidade: 'Cascavel - PR',
    cep: '85810-010',
    mapsUrl: 'https://maps.google.com/?q=Eira+Church+Cascavel',
  },
  cultos: [
    {
      id: '1',
      dia: 'Domingo',
      horario: '10h00',
      descricao: 'Culto Matutino da Família & Eira Kids',
    },
    {
      id: '2',
      dia: 'Domingo',
      horario: '19h00',
      descricao: 'Celebração Noturna & Adoração',
    },
    {
      id: '3',
      dia: 'Quarta-feira',
      horario: '20h00',
      descricao: 'Quarta Fé // Oração, Palavra e Conexão',
    },
    {
      id: '4',
      dia: 'Sábado',
      horario: '19h30',
      descricao: 'Encontro Juventude Hype & One Way',
    },
  ],
  telefone: '(45) 3038-1122',
  whatsapp: '(45) 99881-2233',
  instagram: '@eirachurch',
  email: 'contato@eirachurch.com.br',
};

const SEED_VISITANTES: VisitanteConexao[] = [
  {
    id: 'vis-1',
    nome: 'Lucas Gabriel Andrade',
    telefone: '(45) 99881-2233',
    bairro: 'Coqueiral',
    quem_convidou: 'Gabriel Silva (Célula Hype)',
    faixa_etaria: 'Jovem (18-29)',
    quer_celula: true,
    pedido_oracao: 'Direção profissional e vestibular',
    data_visita: '2026-11-08',
    status: 'novo',
    cadastrado_por: 'Equipe Conexão // Portaria',
  },
  {
    id: 'vis-2',
    nome: 'Beatriz Fontana',
    telefone: '(45) 99112-4455',
    bairro: 'Centro',
    quem_convidou: 'Mariana Costa',
    faixa_etaria: 'Adulto',
    quer_celula: true,
    pedido_oracao: 'Saúde da família e restauração',
    data_visita: '2026-11-08',
    status: 'em_contato',
    cadastrado_por: 'Líder Sarah',
  },
  {
    id: 'vis-3',
    nome: 'Rafael Mendes da Silva',
    telefone: '(45) 99778-9900',
    bairro: 'Santa Cruz',
    quem_convidou: 'Instagram @eirachurch',
    faixa_etaria: 'Adolescente (12-17)',
    quer_celula: false,
    pedido_oracao: 'Paz nos estudos',
    data_visita: '2026-11-01',
    status: 'integrado',
    cadastrado_por: 'Equipe Conexão // Recepção',
  },
  {
    id: 'vis-4',
    nome: 'Juliana e Marcos Ribeiro',
    telefone: '(45) 99443-8822',
    bairro: 'Neva',
    quem_convidou: 'Pr. Carlos',
    faixa_etaria: 'Adulto',
    quer_celula: true,
    pedido_oracao: 'Novo lar e casamento',
    data_visita: '2026-11-08',
    status: 'novo',
    cadastrado_por: 'Equipe Conexão // Balcão',
  },
];

const SEED_CELULAS: Celula[] = [
  {
    id: 'cel-1',
    nome: 'Célula Hype // Intensidade & Propósito',
    rede: 'Hype',
    lider_nome: 'Gabriel Silva',
    lider_telefone: '(45) 99881-2233',
    vice_lider_nome: 'Larissa Moura',
    anfitriao_nome: 'Família Andrade',
    dia_semana: 'Quinta-feira',
    horario: '20h00',
    bairro: 'Coqueiral',
    endereco: 'Rua Flamboyant, 450 - Coqueiral, Cascavel - PR',
    maps_url: 'https://maps.google.com/?q=Rua+Flamboyant+450+Cascavel',
    membros: [
      {
        id: 'm-1',
        nome: 'Gabriel Silva',
        telefone: '(45) 99881-2233',
        tempo_celula: '2 anos',
        batizado: true,
        funcao: 'Líder',
      },
      {
        id: 'm-2',
        nome: 'Larissa Moura',
        telefone: '(45) 99112-9988',
        tempo_celula: '1 ano',
        batizado: true,
        funcao: 'Vice-líder',
      },
      {
        id: 'm-3',
        nome: 'Enzo Ferrari',
        telefone: '(45) 99776-5544',
        tempo_celula: '6 meses',
        batizado: true,
        funcao: 'Líder em Treinamento',
      },
      {
        id: 'm-4',
        nome: 'Lucas Gabriel Andrade',
        telefone: '(45) 99881-2233',
        tempo_celula: 'Recém-chegado',
        batizado: false,
        funcao: 'Membro',
      },
      {
        id: 'm-5',
        nome: 'Giovanna Rocha',
        telefone: '(45) 99654-3321',
        tempo_celula: '3 meses',
        batizado: false,
        funcao: 'Membro',
      },
    ],
  },
  {
    id: 'cel-2',
    nome: 'Célula One Way // Conexão Universitária',
    rede: 'One Way',
    lider_nome: 'Matheus Henrique',
    lider_telefone: '(45) 99443-1122',
    vice_lider_nome: 'Camila Duarte',
    anfitriao_nome: 'Apartamento Matheus',
    dia_semana: 'Sexta-feira',
    horario: '20h30',
    bairro: 'Centro',
    endereco: 'Rua Paraná, 2810 - Apto 42 - Centro, Cascavel - PR',
    maps_url: 'https://maps.google.com/?q=Rua+Parana+2810+Cascavel',
    membros: [
      {
        id: 'm-21',
        nome: 'Matheus Henrique',
        telefone: '(45) 99443-1122',
        tempo_celula: '3 anos',
        batizado: true,
        funcao: 'Líder',
      },
      {
        id: 'm-22',
        nome: 'Camila Duarte',
        telefone: '(45) 99332-8877',
        tempo_celula: '1 ano',
        batizado: true,
        funcao: 'Vice-líder',
      },
      {
        id: 'm-23',
        nome: 'Rodrigo Pires',
        telefone: '(45) 99123-4567',
        tempo_celula: '6 meses',
        batizado: true,
        funcao: 'Membro',
      },
      {
        id: 'm-24',
        nome: 'Beatriz Fontana',
        telefone: '(45) 99112-4455',
        tempo_celula: '1 mês',
        batizado: false,
        funcao: 'Membro',
      },
    ],
  },
  {
    id: 'cel-3',
    nome: 'Célula Famílias de Fé // Neva',
    rede: 'Família',
    lider_nome: 'Pr. Carlos & Pastora Helena',
    lider_telefone: '(45) 99876-0011',
    anfitriao_nome: 'Casal Roberto e Cláudia',
    dia_semana: 'Quarta-feira',
    horario: '19h45',
    bairro: 'Neva',
    endereco: 'Rua Vitória, 120 - Neva, Cascavel - PR',
    maps_url: 'https://maps.google.com/?q=Rua+Vitoria+120+Cascavel',
    membros: [
      {
        id: 'm-31',
        nome: 'Pr. Carlos',
        telefone: '(45) 99876-0011',
        tempo_celula: '5 anos',
        batizado: true,
        funcao: 'Líder',
      },
      {
        id: 'm-32',
        nome: 'Pastora Helena',
        telefone: '(45) 99876-0012',
        tempo_celula: '5 anos',
        batizado: true,
        funcao: 'Vice-líder',
      },
      {
        id: 'm-33',
        nome: 'Roberto Antunes',
        telefone: '(45) 99221-3344',
        tempo_celula: '2 anos',
        batizado: true,
        funcao: 'Anfitrião',
      },
      {
        id: 'm-34',
        nome: 'Cláudia Antunes',
        telefone: '(45) 99221-3345',
        tempo_celula: '2 anos',
        batizado: true,
        funcao: 'Anfitrião',
      },
      {
        id: 'm-35',
        nome: 'Marcos Ribeiro',
        telefone: '(45) 99443-8822',
        tempo_celula: 'Recém-chegado',
        batizado: false,
        funcao: 'Membro',
      },
    ],
  },
];

interface AdminStore {
  // Abas e Navegação
  abaAtiva: AbaAdmin;
  setAbaAtiva: (aba: AbaAdmin) => void;

  // Papel do Usuário Atual (Controle de Acesso)
  usuarioRole: UsuarioRole;
  setUsuarioRole: (role: UsuarioRole) => void;

  // Filtros de Inscrições
  filtros: FiltrosInscricao;
  setFiltros: (filtros: Partial<FiltrosInscricao>) => void;
  resetFiltros: () => void;

  // Edição de Evento
  eventoParaEditar: Evento | null;
  setEventoParaEditar: (evento: Evento | null) => void;

  // White Label e Identidade
  temaAtivo: TemaWhiteLabel;
  setTemaAtivo: (tema: TemaWhiteLabel) => void;
  bordaAtiva: BordaPerfil;
  setBordaAtiva: (borda: BordaPerfil) => void;
  fonteAtiva: FonteOpcao;
  setFonteAtiva: (fonte: FonteOpcao) => void;

  // Modo Escuro / Claro
  modoCor: ModoCor;
  setModoCor: (modo: ModoCor) => void;

  // Configuração da Igreja (White Label & Info)
  igrejaConfig: IgrejaConfig;
  setIgrejaConfig: (config: Partial<IgrejaConfig>) => void;

  // Módulo Conexão (Pessoas Novas / Visitantes)
  visitantes: VisitanteConexao[];
  adicionarVisitante: (visitante: Omit<VisitanteConexao, 'id'>) => void;
  atualizarStatusVisitante: (
    id: string,
    novoStatus: 'novo' | 'em_contato' | 'integrado'
  ) => void;
  removerVisitante: (id: string) => void;

  // Módulo Células
  celulas: Celula[];
  adicionarCelula: (celula: Omit<Celula, 'id'>) => void;
  atualizarCelula: (id: string, celula: Partial<Celula>) => void;
  removerCelula: (id: string) => void;
  adicionarMembroCelula: (celulaId: string, membro: Omit<CelulaMembro, 'id'>) => void;
  removerMembroCelula: (celulaId: string, membroId: string) => void;
  toggleBatismoMembro: (celulaId: string, membroId: string) => void;
}

const FILTROS_INICIAIS: FiltrosInscricao = {
  busca: '',
  evento_id: '',
  status: 'todos',
  metodo_pag: 'todos',
};

// Carrega preferências salvas no navegador com fallback seguro
const obterPreferencia = <T extends string>(chave: string, padrao: T): T => {
  if (typeof window === 'undefined') return padrao;
  try {
    const val = localStorage.getItem(chave);
    return (val as T) || padrao;
  } catch {
    return padrao;
  }
};

export const useAdminStore = create<AdminStore>((set) => ({
  abaAtiva: 'dashboard',
  setAbaAtiva: (aba) => set({ abaAtiva: aba }),

  usuarioRole: 'admin',
  setUsuarioRole: (role) => set({ usuarioRole: role }),

  filtros: FILTROS_INICIAIS,
  setFiltros: (novosFiltros) =>
    set((state) => ({ filtros: { ...state.filtros, ...novosFiltros } })),
  resetFiltros: () => set({ filtros: FILTROS_INICIAIS }),

  eventoParaEditar: null,
  setEventoParaEditar: (evento) => set({ eventoParaEditar: evento }),

  temaAtivo: obterPreferencia<TemaWhiteLabel>('eira_theme', 'eira-signature'),
  setTemaAtivo: (tema) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', tema);
      try {
        localStorage.setItem('eira_theme', tema);
      } catch {}
    }
    set({ temaAtivo: tema });
  },

  bordaAtiva: obterPreferencia<BordaPerfil>('eira_border', 'balanced'),
  setBordaAtiva: (borda) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-border', borda);
      try {
        localStorage.setItem('eira_border', borda);
      } catch {}
    }
    set({ bordaAtiva: borda });
  },

  fonteAtiva: obterPreferencia<FonteOpcao>('eira_font', 'manrope'),
  setFonteAtiva: (fonte) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font', fonte);
      try {
        localStorage.setItem('eira_font', fonte);
      } catch {}
    }
    set({ fonteAtiva: fonte });
  },

  modoCor: obterPreferencia<ModoCor>('eira_color_mode', 'light'),
  setModoCor: (modo) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-mode', modo);
      if (modo === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('eira_color_mode', modo);
      } catch {}
    }
    set({ modoCor: modo });
  },

  igrejaConfig: IGREJA_CONFIG_PADRAO,
  setIgrejaConfig: (novaConfig) =>
    set((state) => {
      const atualizado: IgrejaConfig = {
        ...state.igrejaConfig,
        ...novaConfig,
        endereco: {
          ...state.igrejaConfig.endereco,
          ...(novaConfig.endereco || {}),
        },
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_church_config', JSON.stringify(atualizado));
        } catch {}
      }
      return { igrejaConfig: atualizado };
    }),

  visitantes: SEED_VISITANTES,
  adicionarVisitante: (novoVisitante) =>
    set((state) => ({
      visitantes: [
        {
          ...novoVisitante,
          id: `vis-${Date.now()}`,
        },
        ...state.visitantes,
      ],
    })),

  atualizarStatusVisitante: (id, novoStatus) =>
    set((state) => ({
      visitantes: state.visitantes.map((v) =>
        v.id === id ? { ...v, status: novoStatus } : v
      ),
    })),

  removerVisitante: (id) =>
    set((state) => ({
      visitantes: state.visitantes.filter((v) => v.id !== id),
    })),

  celulas: SEED_CELULAS,
  adicionarCelula: (novaCelula) =>
    set((state) => ({
      celulas: [
        {
          ...novaCelula,
          id: `cel-${Date.now()}`,
        },
        ...state.celulas,
      ],
    })),

  atualizarCelula: (id, dados) =>
    set((state) => ({
      celulas: state.celulas.map((c) =>
        c.id === id ? { ...c, ...dados } : c
      ),
    })),

  removerCelula: (id) =>
    set((state) => ({
      celulas: state.celulas.filter((c) => c.id !== id),
    })),

  adicionarMembroCelula: (celulaId, novoMembro) =>
    set((state) => ({
      celulas: state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        const membroCriado: CelulaMembro = {
          ...novoMembro,
          id: `m-${Date.now()}`,
        };
        return {
          ...c,
          membros: [...c.membros, membroCriado],
        };
      }),
    })),

  removerMembroCelula: (celulaId, membroId) =>
    set((state) => ({
      celulas: state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        return {
          ...c,
          membros: c.membros.filter((m) => m.id !== membroId),
        };
      }),
    })),

  toggleBatismoMembro: (celulaId, membroId) =>
    set((state) => ({
      celulas: state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        return {
          ...c,
          membros: c.membros.map((m) =>
            m.id === membroId ? { ...m, batizado: !m.batizado } : m
          ),
        };
      }),
    })),
}));
