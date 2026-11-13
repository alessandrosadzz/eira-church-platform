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
import {
  atualizarFuncaoLiderSupabase,
  buscarCelulasSupabase,
} from '../lib/eventoAdapter';

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
  instagram: '@daeirajoinville',
  facebook: 'https://facebook.com/eirachurch',
  youtube: 'https://youtube.com/@eirachurch',
  site: 'https://eirachurch.com.br',
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
  usuarioNomeLogado: string;
  setUsuarioNomeLogado: (nome: string) => void;

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
  setVisitantes: (visitantes: VisitanteConexao[]) => void;
  adicionarVisitante: (visitante: Omit<VisitanteConexao, 'id'>) => void;
  atualizarStatusVisitante: (
    id: string,
    novoStatus: 'novo' | 'em_contato' | 'integrado'
  ) => void;
  atualizarVisitante: (id: string, dados: Partial<VisitanteConexao>) => void;
  removerVisitante: (id: string) => void;

  // Módulo Células
  celulas: Celula[];
  setCelulas: (celulas: Celula[]) => void;
  setLideres: (lideres: LiderConta[]) => void;
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

  // Gestão e Alteração de Funções (Pastores e Admins)
  atualizarFuncaoPessoa: (dados: {
    pessoaNome: string;
    telefone?: string | null;
    email?: string | null;
    novaFuncao: UsuarioRole | 'membro';
    celulaId?: string;
    rede?: string;
    celulaNome?: string;
    novoUsuario?: string;
    novaSenha?: string;
  }) => Promise<void>;

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

export const useAdminStore = create<AdminStore>((set, get) => ({
  abaAtiva: 'dashboard',
  setAbaAtiva: (aba) => set({ abaAtiva: aba }),

  usuarioRole: 'admin',
  setUsuarioRole: (role) => set({ usuarioRole: role }),

  usuarioNomeLogado: obterPreferencia<string>('eira_usuario_nome', ''),
  setUsuarioNomeLogado: (nome) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eira_usuario_nome', nome);
      } catch {}
    }
    set({ usuarioNomeLogado: nome });
  },

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

  setLideres: (lideres) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eira_lideres', JSON.stringify(lideres));
      } catch {}
    }
    set({ lideres });
  },

  setCelulas: (celulas) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eira_celulas', JSON.stringify(celulas));
      } catch {}
    }
    set({ celulas });
  },

  setVisitantes: (visitantes) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eira_visitantes', JSON.stringify(visitantes));
      } catch {}
    }
    set({ visitantes });
  },

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

    // 3. Líderes de 12 (Discipuladores / Supervisores de Rede)
    if (
      (u === 'lider12' ||
        u === 'lideres12' ||
        u === 'rede12' ||
        u === 'redede12' ||
        u === 'liderrede' ||
        u === 'liderderede' ||
        u === 'discipulador') &&
      s === 'eira@1212'
    ) {
      return { valido: true, role: 'lider_12', nome: 'Liderança de Rede (12)' };
    }

    // 4. Equipe Conexão (Recepção & Acolhimento de Visitantes)
    if (
      (u === 'conexao' ||
        u === 'equipeconexao' ||
        u === 'acolhimento' ||
        u === 'recepcao') &&
      s === 'eira@1212'
    ) {
      return { valido: true, role: 'conexao', nome: 'Equipe Conexão' };
    }

    // 4. Líderes de Célula e Líderes de 12 Cadastrados Localmente
    const state = useAdminStore.getState();
    const liderEncontrado = state.lideres.find(
      (l) => l.usuarioOuEmail.trim().toLowerCase() === u && l.senha === s
    );
    if (liderEncontrado) {
      return {
        valido: true,
        role: liderEncontrado.role || 'lider_celula',
        nome: liderEncontrado.nome,
      };
    }

    // 5. Líderes cadastrados no Supabase (metadados na célula)
    for (const cel of state.celulas) {
      if (cel.anfitriao_nome && cel.anfitriao_nome.startsWith('{')) {
        try {
          const meta = JSON.parse(cel.anfitriao_nome);
          if (meta.usuario && meta.usuario.trim().toLowerCase() === u && meta.senha === s) {
            return {
              valido: true,
              role: (meta.role as UsuarioRole) || 'lider_celula',
              nome: cel.lider_nome,
            };
          }
        } catch {}
      }
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

  atualizarVisitante: (id, dados) =>
    set((state) => {
      const novaLista = state.visitantes.map((v) =>
        v.id === id ? { ...v, ...dados } : v
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

  atualizarFuncaoPessoa: async (dados) => {
    const nomeLimpo = dados.pessoaNome.trim();
    const nomeLower = nomeLimpo.toLowerCase();
    const roleNome =
      dados.novaFuncao === 'lider_12'
        ? 'Líder de 12 (Rede)'
        : dados.novaFuncao === 'lider_celula'
        ? 'Líder de Célula'
        : dados.novaFuncao === 'conexao'
        ? 'Equipe Conexão'
        : dados.novaFuncao === 'pastor'
        ? 'Pastor da Igreja'
        : dados.novaFuncao === 'admin'
        ? 'Administrador Geral'
        : 'Membro';

    const usuarioLogado = get().usuarioNomeLogado || 'Pastores Eira Church';

    // Registra atividade para notificação
    const novaAtividade: AtividadeLider = {
      id: `atv-funcao-${Date.now()}`,
      tipo: 'celula_atualizada',
      liderNome: usuarioLogado,
      titulo: 'Função Ministerial Atualizada',
      descricao: `${nomeLimpo} foi atualizado(a) para a função ${roleNome}.`,
      detalhe: `Atualizado por ${usuarioLogado} em ${new Date().toLocaleDateString('pt-BR')}`,
      timestamp: new Date().toISOString(),
      lida: false,
    };

    // Atualiza contas de líderes no estado
    const lideresAtuais = [...get().lideres];
    const idx = lideresAtuais.findIndex((l) => l.nome.trim().toLowerCase() === nomeLower);

    let novaListaLideres = lideresAtuais;
    if (dados.novaFuncao === 'membro') {
      novaListaLideres = lideresAtuais.filter((l) => l.nome.trim().toLowerCase() !== nomeLower);
    } else {
      const usuarioValido =
        dados.novoUsuario ||
        (idx >= 0
          ? lideresAtuais[idx].usuarioOuEmail
          : nomeLower
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '.'));
      const senhaValida = dados.novaSenha || (idx >= 0 ? lideresAtuais[idx].senha : 'eira@1212');

      const conta: LiderConta = {
        id: idx >= 0 ? lideresAtuais[idx].id : `lid-${Date.now()}`,
        nome: nomeLimpo,
        usuarioOuEmail: usuarioValido,
        senha: senhaValida,
        telefone: dados.telefone || (idx >= 0 ? lideresAtuais[idx].telefone : ''),
        celulaNome: dados.celulaNome || (idx >= 0 ? lideresAtuais[idx].celulaNome : 'Célula Eira'),
        rede: dados.rede || (idx >= 0 ? lideresAtuais[idx].rede : 'Geral'),
        role: dados.novaFuncao as UsuarioRole,
        criadoEm: idx >= 0 ? lideresAtuais[idx].criadoEm : new Date().toISOString(),
      };

      if (idx >= 0) {
        novaListaLideres[idx] = conta;
      } else {
        novaListaLideres = [conta, ...lideresAtuais];
      }
    }

    const novasAtividades = [novaAtividade, ...get().atividadesLideres].slice(0, 50);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('eira_lideres', JSON.stringify(novaListaLideres));
        localStorage.setItem('eira_atividades_lideres', JSON.stringify(novasAtividades));
      } catch {}
    }

    set({ lideres: novaListaLideres, atividadesLideres: novasAtividades });

    // Sincroniza com Supabase via adapter
    try {
      await atualizarFuncaoLiderSupabase(dados);
      const celulasAtualizadas = await buscarCelulasSupabase();
      if (celulasAtualizadas && celulasAtualizadas.length > 0) {
        set({ celulas: celulasAtualizadas });
      }
    } catch (err) {
      console.warn('Erro ao sincronizar função no Supabase:', err);
    }
  },

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
