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
  LiderConta,
} from '../types/igreja';

export type AbaAdmin =
  | 'dashboard'
  | 'conexao'
  | 'celulas'
  | 'inscricoes'
  | 'eventos'
  | 'novo-evento'
  | 'configuracao';

export type {
  TemaWhiteLabel,
  BordaPerfil,
  FonteOpcao,
  ModoCor,
  UsuarioRole,
  Celula,
  CelulaMembro,
  LiderConta,
};

// Reset de versão para limpar dados de demonstração antigos do navegador do usuário
if (typeof window !== 'undefined') {
  try {
    const v = localStorage.getItem('eira_version');
    if (v !== 'v2_clean') {
      localStorage.removeItem('eira_visitantes');
      localStorage.removeItem('eira_celulas');
      localStorage.removeItem('eira_church_config');
      localStorage.removeItem('eira_auth_session');
      localStorage.removeItem('eira_lideres');
      localStorage.setItem('eira_version', 'v2_clean');
    }
  } catch {}
}

const IGREJA_CONFIG_PADRAO: IgrejaConfig = {
  nome: 'Eira Church',
  slogan: 'Uma igreja viva, acolhedora e relevante em células',
  logoUrl: '',
  bannerUrl: '',
  faviconUrl: '',
  endereco: {
    logradouro: '',
    bairro: '',
    cidade: '',
    cep: '',
    mapsUrl: '',
  },
  cultos: [],
  telefone: '',
  whatsapp: '',
  instagram: '',
  email: '',
  chavePix: 'eirajoinville@hotmail.com',
  titularPix: 'Eira Church Joinville',
  cidadePix: 'Joinville',
  copiaEColaPix: '00020126470014BR.GOV.BCB.PIX0125eirajoinville@hotmail.com5204000053039865802BR5921Eira Church Joinville6009Joinville62140510EIRACHURCH630461FC',
  qrCodePixUrl: '/pix-qrcode.png',
};

const SEED_VISITANTES: VisitanteConexao[] = [];
const SEED_CELULAS: Celula[] = [];

interface AdminStore {
  // Abas e Navegação
  abaAtiva: AbaAdmin;
  setAbaAtiva: (aba: AbaAdmin) => void;

  // Papel do Usuário Atual (Controle de Acesso)
  usuarioRole: UsuarioRole;
  setUsuarioRole: (role: UsuarioRole) => void;

  // Autenticação & Contas de Líderes
  lideres: LiderConta[];
  cadastrarLider: (lider: Omit<LiderConta, 'id' | 'criadoEm'>) => void;
  validarLogin: (
    usuarioOuEmail: string,
    senha: string
  ) => { valido: boolean; role?: UsuarioRole; nome?: string };

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
  editarMembroCelula: (
    celulaId: string,
    membroId: string,
    dados: Partial<CelulaMembro>
  ) => void;
  removerMembroCelula: (celulaId: string, membroId: string) => void;
  toggleBatismoMembro: (celulaId: string, membroId: string) => void;

  // Notificações & Relatório de Atividades dos Líderes (Para Pastores e Admins)
  atividadesLideres: AtividadeLider[];
  registrarAtividadeLider: (
    atv: Omit<AtividadeLider, 'id' | 'timestamp' | 'lida'>
  ) => void;
  marcarAtividadesLideresLidas: () => void;
}

export interface AtividadeLider {
  id: string;
  tipo: 'novo_lider' | 'membro_editado' | 'novo_membro' | 'celula_atualizada';
  liderNome: string;
  titulo: string;
  descricao: string;
  detalhe?: string;
  timestamp: string;
  lida?: boolean;
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

const obterListaArmazenada = <T>(chave: string, padrao: T[]): T[] => {
  if (typeof window === 'undefined') return padrao;
  try {
    const val = localStorage.getItem(chave);
    return val ? JSON.parse(val) : padrao;
  } catch {
    return padrao;
  }
};

const obterConfigArmazenada = (padrao: IgrejaConfig): IgrejaConfig => {
  if (typeof window === 'undefined') return padrao;
  try {
    const val = localStorage.getItem('eira_church_config');
    return val ? { ...padrao, ...JSON.parse(val) } : padrao;
  } catch {
    return padrao;
  }
};

export const useAdminStore = create<AdminStore>((set) => ({
  abaAtiva: 'dashboard',
  setAbaAtiva: (aba) => set({ abaAtiva: aba }),

  usuarioRole: 'admin',
  setUsuarioRole: (role) => set({ usuarioRole: role }),

  lideres: obterListaArmazenada<LiderConta>('eira_lideres', []),

  cadastrarLider: (dados) =>
    set((state) => {
      const novoLider: LiderConta = {
        ...dados,
        id: `lid-${Date.now()}`,
        criadoEm: new Date().toISOString(),
      };
      const listaAtualizada = [novoLider, ...state.lideres];

      const novaAtv: AtividadeLider = {
        id: `atv-${Date.now()}`,
        tipo: 'novo_lider',
        liderNome: dados.nome,
        titulo: 'Novo Líder Cadastrado',
        descricao: `${dados.nome} cadastrou acesso para a célula "${dados.celulaNome}" (${dados.rede}).`,
        detalhe: `Usuário: ${dados.usuarioOuEmail} • WhatsApp: ${dados.telefone}`,
        timestamp: new Date().toISOString(),
        lida: false,
      };
      const novasAtividades = [novaAtv, ...state.atividadesLideres].slice(0, 50);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_lideres', JSON.stringify(listaAtualizada));
          localStorage.setItem('eira_atividades_lideres', JSON.stringify(novasAtividades));
        } catch {}
      }
      return { lideres: listaAtualizada, atividadesLideres: novasAtividades };
    }),

  validarLogin: (usuarioOuEmail, senha) => {
    const u = usuarioOuEmail.trim().toLowerCase();
    const s = senha.trim();

    // 1. Pastores
    if (u === 'pastores' && s === 'eira@1212') {
      return { valido: true, role: 'pastor', nome: 'Pastores Eira Church' };
    }

    // 2. Administrativo
    if ((u === 'admin' || u === 'adm') && s === 'eira@1212') {
      return { valido: true, role: 'admin', nome: 'Administração Eira Church' };
    }

    // 3. Líderes de Célula Cadastrados
    const state = useAdminStore.getState();
    const liderEncontrado = state.lideres.find(
      (l) => l.usuarioOuEmail.trim().toLowerCase() === u && l.senha === s
    );
    if (liderEncontrado) {
      return { valido: true, role: 'lider', nome: liderEncontrado.nome };
    }

    return { valido: false };
  },

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

  igrejaConfig: obterConfigArmazenada(IGREJA_CONFIG_PADRAO),
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

  visitantes: obterListaArmazenada<VisitanteConexao>('eira_visitantes', SEED_VISITANTES),
  adicionarVisitante: (novoVisitante) =>
    set((state) => {
      const novaLista = [
        {
          ...novoVisitante,
          id: `vis-${Date.now()}`,
        },
        ...state.visitantes,
      ];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_visitantes', JSON.stringify(novaLista));
        } catch {}
      }
      return { visitantes: novaLista };
    }),

  atualizarStatusVisitante: (id, novoStatus) =>
    set((state) => {
      const novaLista = state.visitantes.map((v) =>
        v.id === id ? { ...v, status: novoStatus } : v
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_visitantes', JSON.stringify(novaLista));
        } catch {}
      }
      return { visitantes: novaLista };
    }),

  removerVisitante: (id) =>
    set((state) => {
      const novaLista = state.visitantes.filter((v) => v.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_visitantes', JSON.stringify(novaLista));
        } catch {}
      }
      return { visitantes: novaLista };
    }),

  celulas: obterListaArmazenada<Celula>('eira_celulas', SEED_CELULAS),
  adicionarCelula: (novaCelula) =>
    set((state) => {
      const novaLista = [
        {
          ...novaCelula,
          id: `cel-${Date.now()}`,
        },
        ...state.celulas,
      ];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  atualizarCelula: (id, dados) =>
    set((state) => {
      const novaLista = state.celulas.map((c) =>
        c.id === id ? { ...c, ...dados } : c
      );
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  removerCelula: (id) =>
    set((state) => {
      const novaLista = state.celulas.filter((c) => c.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  adicionarMembroCelula: (celulaId, novoMembro) =>
    set((state) => {
      const novaLista = state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        const membroCriado: CelulaMembro = {
          ...novoMembro,
          id: `m-${Date.now()}`,
        };
        return {
          ...c,
          membros: [...c.membros, membroCriado],
        };
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  editarMembroCelula: (celulaId, membroId, dados) =>
    set((state) => {
      const celulaAtual = state.celulas.find((c) => c.id === celulaId);
      const novaLista = state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        return {
          ...c,
          membros: c.membros.map((m) =>
            m.id === membroId ? { ...m, ...dados } : m
          ),
        };
      });

      const novaAtv: AtividadeLider = {
        id: `atv-${Date.now()}`,
        tipo: 'membro_editado',
        liderNome: celulaAtual?.lider_nome || 'Líder',
        titulo: 'Atualização em Célula',
        descricao: `Líder ${celulaAtual?.lider_nome || ''} atualizou dados de membro na célula "${celulaAtual?.nome || ''}".`,
        timestamp: new Date().toISOString(),
        lida: false,
      };
      const novasAtividades = [novaAtv, ...state.atividadesLideres].slice(0, 50);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
          localStorage.setItem('eira_atividades_lideres', JSON.stringify(novasAtividades));
        } catch {}
      }
      return { celulas: novaLista, atividadesLideres: novasAtividades };
    }),

  removerMembroCelula: (celulaId, membroId) =>
    set((state) => {
      const novaLista = state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        return {
          ...c,
          membros: c.membros.filter((m) => m.id !== membroId),
        };
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  toggleBatismoMembro: (celulaId, membroId) =>
    set((state) => {
      const novaLista = state.celulas.map((c) => {
        if (c.id !== celulaId) return c;
        return {
          ...c,
          membros: c.membros.map((m) =>
            m.id === membroId ? { ...m, batizado: !m.batizado } : m
          ),
        };
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_celulas', JSON.stringify(novaLista));
        } catch {}
      }
      return { celulas: novaLista };
    }),

  atividadesLideres: obterListaArmazenada<AtividadeLider>('eira_atividades_lideres', []),

  registrarAtividadeLider: (atv) =>
    set((state) => {
      const nova: AtividadeLider = {
        ...atv,
        id: `atv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        lida: false,
      };
      const lista = [nova, ...state.atividadesLideres].slice(0, 50);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_atividades_lideres', JSON.stringify(lista));
        } catch {}
      }
      return { atividadesLideres: lista };
    }),

  marcarAtividadesLideresLidas: () =>
    set((state) => {
      const lista = state.atividadesLideres.map((a) => ({ ...a, lida: true }));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('eira_atividades_lideres', JSON.stringify(lista));
        } catch {}
      }
      return { atividadesLideres: lista };
    }),
}));
