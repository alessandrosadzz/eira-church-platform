// src/lib/eventoAdapter.ts

import { supabase } from './supabase';
import { Evento, CategoriaEvento } from '../types/evento';
import { Inscricao, MetodoPagamento, StatusInscricao } from '../types/inscricao';
import { Celula, CelulaMembro, VisitanteConexao, LiderConta } from '../types/igreja';

const CATEGORIAS_VALIDAS_DB = ['Conferência', 'Acampamento', 'Encontro', 'Outro'];

function normalizarCategoriaDB(cat: string): string {
  if (CATEGORIAS_VALIDAS_DB.includes(cat)) return cat;
  if (cat.toLowerCase().includes('acampamento')) return 'Acampamento';
  if (cat.toLowerCase().includes('confer')) return 'Conferência';
  if (cat.toLowerCase().includes('encontro')) return 'Encontro';
  return 'Outro';
}

function garantirUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Busca todos os eventos cadastrados no Supabase, mesclando com o cache local e contagem real de inscritos.
 */
export async function buscarEventosSupabase(): Promise<Evento[]> {
  try {
    const [{ data, error }, { data: todasInscricoes }] = await Promise.all([
      supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('inscricoes')
        .select('id, evento_id, status, valor_pago'),
    ]);

    if (error) {
      console.warn('Erro ao buscar eventos do Supabase:', error.message);
      return carregarEventosLocal();
    }

    // Mapa de contagens por evento
    const contagemInscritos: Record<string, number> = {};
    const contagemConfirmados: Record<string, number> = {};
    const receitaMap: Record<string, number> = {};

    (todasInscricoes || []).forEach((i: any) => {
      const evId = i.evento_id;
      if (evId) {
        contagemInscritos[evId] = (contagemInscritos[evId] || 0) + 1;
        if (i.status === 'pago' || i.status === 'isento') {
          contagemConfirmados[evId] = (contagemConfirmados[evId] || 0) + 1;
          receitaMap[evId] = (receitaMap[evId] || 0) + Number(i.valor_pago || 0);
        }
      }
    });

    if (data && data.length > 0) {
      const mapeados: Evento[] = data.map((row: any) => {
        const vagas = Number(row.limite_vagas || 100);
        const totalInscritos = contagemInscritos[row.id] || 0;
        const confirmados = contagemConfirmados[row.id] || 0;
        const vagasRestantes = Math.max(vagas - totalInscritos, 0);

        let redeDoEvento: 'Hype' | 'One Way' | 'Padrão' = 'Padrão';
        if (row.horario && typeof row.horario === 'string') {
          if (row.horario.trim().startsWith('{')) {
            try {
              const metaH = JSON.parse(row.horario);
              if (metaH.rede && ['Hype', 'One Way', 'Padrão'].includes(metaH.rede)) {
                redeDoEvento = metaH.rede;
              }
            } catch {}
          } else if (['Hype', 'One Way', 'Padrão'].includes(row.horario.trim())) {
            redeDoEvento = row.horario.trim() as any;
          }
        }
        if (redeDoEvento === 'Padrão' && typeof window !== 'undefined') {
          try {
            const mapaRedes = JSON.parse(localStorage.getItem('eira_eventos_rede_map') || '{}');
            if (mapaRedes[row.id] || mapaRedes[row.slug]) {
              redeDoEvento = mapaRedes[row.id] || mapaRedes[row.slug];
            }
          } catch {}
        }
        if (redeDoEvento === 'Padrão') {
          const nomeL = (row.nome || '').toLowerCase();
          if (nomeL.includes('hype') || nomeL.includes('marcados')) redeDoEvento = 'Hype';
          else if (nomeL.includes('one way') || nomeL.includes('oneway')) redeDoEvento = 'One Way';
        }

        return {
          id: row.id,
          nome: row.nome,
          slug: row.slug,
          descricao: row.descricao || '',
          data_inicio: row.data_inicio,
          data_fim: row.data_fim,
          local_nome: row.local || 'Eira Church',
          valor: Number(row.preco || 0),
          vagas,
          imagem_url: row.imagem_url || undefined,
          ativo: row.ativo !== false,
          categoria: (row.categoria as CategoriaEvento) || 'Outro',
          rede: redeDoEvento,
          campos: ['nome', 'telefone', 'email', 'nascimento'],
          total_inscritos: totalInscritos,
          inscritos_confirmados: totalInscritos,
          vagas_restantes: vagasRestantes,
          receita_confirmada: receitaMap[row.id] || 0,
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });

      salvarEventosLocal(mapeados);
      return mapeados;
    }

    return carregarEventosLocal();
  } catch (err) {
    console.warn('Falha na requisição de eventos:', err);
    return carregarEventosLocal();
  }
}

/**
 * Salva ou atualiza um evento tanto no Supabase quanto no LocalStorage.
 */
export async function salvarEventoSupabase(evento: Partial<Evento>): Promise<Evento> {
  const idValido = garantirUUID(evento.id);
  const slugValido =
    evento.slug?.trim() ||
    evento.nome
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') ||
    `evento-${Date.now()}`;

  const redeEscolhida = evento.rede || 'Hype';
  const payloadDB = {
    id: idValido,
    nome: evento.nome?.trim() || 'Evento Eira Church',
    slug: slugValido,
    descricao: evento.descricao?.trim() || '',
    data_inicio: evento.data_inicio || new Date().toISOString(),
    data_fim: evento.data_fim || null,
    local: evento.local_nome?.trim() || 'Eira Church Joinville',
    horario: JSON.stringify({ rede: redeEscolhida }),
    preco: Number(evento.valor || 0),
    limite_vagas: Number(evento.vagas || 100),
    imagem_url: evento.imagem_url?.trim() || null,
    ativo: evento.ativo !== false,
    categoria: normalizarCategoriaDB(evento.categoria || 'Outro'),
    destaque: true,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const mapa = JSON.parse(localStorage.getItem('eira_eventos_rede_map') || '{}');
      mapa[idValido] = redeEscolhida;
      mapa[slugValido] = redeEscolhida;
      localStorage.setItem('eira_eventos_rede_map', JSON.stringify(mapa));
    } catch {}
  }

  try {
    const { error } = await supabase.from('eventos').upsert(payloadDB);
    if (error) {
      console.warn('Erro ao upsert evento no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha de rede ao salvar evento:', err);
  }

  const eventoCompleto: Evento = {
    ...evento,
    id: idValido,
    nome: payloadDB.nome,
    slug: payloadDB.slug,
    descricao: payloadDB.descricao,
    data_inicio: payloadDB.data_inicio,
    data_fim: payloadDB.data_fim || undefined,
    local_nome: payloadDB.local,
    valor: payloadDB.preco,
    vagas: payloadDB.limite_vagas,
    imagem_url: payloadDB.imagem_url || undefined,
    ativo: payloadDB.ativo,
    categoria: (evento.categoria as CategoriaEvento) || 'Outro',
    rede: redeEscolhida,
    campos: evento.campos || ['nome', 'telefone', 'email', 'nascimento'],
    total_inscritos: evento.total_inscritos || 0,
    inscritos_confirmados: evento.inscritos_confirmados || 0,
    vagas_restantes: payloadDB.limite_vagas,
    receita_confirmada: evento.receita_confirmada || 0,
    created_at: evento.created_at || new Date().toISOString(),
    updated_at: payloadDB.updated_at,
  };

  // Atualiza LocalStorage
  const listaLocal = carregarEventosLocal();
  const index = listaLocal.findIndex((e) => e.id === idValido || e.slug === slugValido);
  if (index >= 0) {
    listaLocal[index] = eventoCompleto;
  } else {
    listaLocal.unshift(eventoCompleto);
  }
  salvarEventosLocal(listaLocal);

  return eventoCompleto;
}

export function carregarEventosLocal(): Evento[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem('eira_eventos');
    if (!salvos) return [];
    const evs: Evento[] = JSON.parse(salvos);
    const inscs = carregarInscricoesLocal();
    const contagem: Record<string, number> = {};
    inscs.forEach((i) => {
      if (i.evento_id) contagem[i.evento_id] = (contagem[i.evento_id] || 0) + 1;
    });

    let mapaRedes: Record<string, string> = {};
    try {
      mapaRedes = JSON.parse(localStorage.getItem('eira_eventos_rede_map') || '{}');
    } catch {}

    return evs.map((e) => {
      const total = contagem[e.id] ?? e.total_inscritos ?? 0;
      const vagas = e.vagas || 100;

      let r = e.rede;
      if (!r || r === 'Padrão') {
        if (mapaRedes[e.id] || mapaRedes[e.slug]) {
          r = (mapaRedes[e.id] || mapaRedes[e.slug]) as any;
        } else {
          const nomeL = (e.nome || '').toLowerCase();
          if (nomeL.includes('hype') || nomeL.includes('marcados')) r = 'Hype';
          else if (nomeL.includes('one way') || nomeL.includes('oneway')) r = 'One Way';
          else r = 'Padrão';
        }
      }

      return {
        ...e,
        rede: r as any,
        total_inscritos: total,
        inscritos_confirmados: total,
        vagas_restantes: Math.max(vagas - total, 0),
      };
    });
  } catch {
    return [];
  }
}

export function salvarEventosLocal(lista: Evento[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('eira_eventos', JSON.stringify(lista));
  } catch {}
}

/**
 * Busca todas as inscrições registradas no Supabase e mescla comprovantes do LocalStorage.
 */
export async function buscarInscricoesSupabase(): Promise<Inscricao[]> {
  const comprovantesMap: Record<string, string> = {};
  const detalhesMap: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      const salvosComp = localStorage.getItem('eira_comprovantes_map');
      if (salvosComp) Object.assign(comprovantesMap, JSON.parse(salvosComp));

      const salvosDet = localStorage.getItem('eira_inscricoes_detalhes_map');
      if (salvosDet) Object.assign(detalhesMap, JSON.parse(salvosDet));
    } catch {}
  }

  try {
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*, evento:eventos(nome, preco, categoria, imagem_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar inscricoes no Supabase:', error.message);
      return carregarInscricoesLocal();
    }

    if (data && data.length > 0) {
      const mapeadas: Inscricao[] = data.map((row: any) => {
        let extraCpf: any = {};
        if (row.cpf && typeof row.cpf === 'string' && row.cpf.trim().startsWith('{')) {
          try {
            extraCpf = JSON.parse(row.cpf);
          } catch {}
        }
        const extraLocal = detalhesMap[row.codigo_inscricao] || detalhesMap[row.id] || {};
        const extra = { ...extraCpf, ...extraLocal };

        return {
          id: row.id,
          evento_id: row.evento_id,
          nome: row.nome,
          email: row.email || undefined,
          telefone: row.telefone,
          nascimento: extra.nascimento || row.nascimento || null,
          idade: extra.idade ?? (row.idade ? Number(row.idade) : null),
          nome_responsavel: extra.resp_nome || extra.nome_responsavel || row.nome_responsavel || null,
          telefone_responsavel: extra.resp_tel || extra.telefone_responsavel || row.telefone_responsavel || null,
          email_responsavel: extra.resp_email || extra.email_responsavel || row.email_responsavel || null,
          rede_participante: extra.rede || extra.rede_participante || null,
          endereco: extra.endereco || null,
          observacoes_saude: extra.saude || extra.observacoes_saude || null,
          participa_celula: extra.participa_celula ?? row.participa_celula,
          nome_celula_lider: extra.celula || extra.nome_celula_lider || null,
          status: (row.status as StatusInscricao) || 'pendente',
          metodo_pag: (row.metodo_pagamento as MetodoPagamento) || 'pix',
          comprovante_hash: row.codigo_inscricao,
          comprovante_url: comprovantesMap[row.codigo_inscricao] || comprovantesMap[row.id] || null,
          role: extra.role || null,
          usuario: extra.usuario || null,
          created_at: row.data_inscricao || row.created_at,
          evento: {
            nome: row.evento?.nome || 'Evento Geral',
            categoria: row.evento?.categoria || 'Outro',
            rede: extra.rede || 'Padrão',
            valor: Number(row.evento?.preco || row.valor_pago || 0),
          },
        };
      });

      salvarInscricoesLocal(mapeadas);
      return mapeadas;
    }

    return carregarInscricoesLocal();
  } catch (err) {
    console.warn('Falha na busca de inscrições:', err);
    return carregarInscricoesLocal();
  }
}

/**
 * Salva uma nova inscrição no Supabase e no LocalStorage.
 */
export async function salvarInscricaoSupabase(dados: {
  evento_id: string;
  nome: string;
  telefone: string;
  email?: string;
  nascimento?: string | null;
  idade?: number | string | null;
  nome_responsavel?: string | null;
  telefone_responsavel?: string | null;
  email_responsavel?: string | null;
  rede_participante?: string | null;
  endereco?: string | null;
  participa_celula?: boolean;
  nome_celula_lider?: string | null;
  observacoes_saude?: string | null;
  status: StatusInscricao;
  metodo_pag: MetodoPagamento | 'pendente';
  valor_pago: number;
  codigo_inscricao: string;
  comprovante_url?: string | null;
  evento_nome?: string;
}): Promise<Inscricao> {
  const idValido = garantirUUID();

  const metadataParaCpf = JSON.stringify({
    resp_tel: dados.telefone_responsavel || null,
    resp_email: dados.email_responsavel || null,
    resp_nome: dados.nome_responsavel || null,
    idade: dados.idade ? Number(dados.idade) : null,
    nascimento: dados.nascimento || null,
    rede: dados.rede_participante || null,
    endereco: dados.endereco || null,
    participa_celula: dados.participa_celula,
    celula: dados.nome_celula_lider || null,
    saude: dados.observacoes_saude || null,
  });

  // Salva comprovante e detalhes no mapa local
  if (typeof window !== 'undefined') {
    try {
      if (dados.comprovante_url) {
        const salvos = localStorage.getItem('eira_comprovantes_map');
        const mapa = salvos ? JSON.parse(salvos) : {};
        mapa[dados.codigo_inscricao] = dados.comprovante_url;
        mapa[idValido] = dados.comprovante_url;
        localStorage.setItem('eira_comprovantes_map', JSON.stringify(mapa));
      }

      const salvosDet = localStorage.getItem('eira_inscricoes_detalhes_map');
      const mapaDet = salvosDet ? JSON.parse(salvosDet) : {};
      mapaDet[dados.codigo_inscricao] = JSON.parse(metadataParaCpf);
      mapaDet[idValido] = JSON.parse(metadataParaCpf);
      localStorage.setItem('eira_inscricoes_detalhes_map', JSON.stringify(mapaDet));
    } catch {}
  }

  // Insere no Supabase
  try {
    const { error } = await supabase.from('inscricoes').insert({
      id: idValido,
      evento_id: dados.evento_id,
      codigo_inscricao: dados.codigo_inscricao,
      nome: dados.nome.trim(),
      telefone: dados.telefone.trim(),
      email: dados.email?.trim() || null,
      cpf: metadataParaCpf,
      status: dados.status,
      metodo_pagamento: dados.metodo_pag,
      valor_pago: Number(dados.valor_pago || 0),
      data_inscricao: new Date().toISOString(),
    });

    if (error) {
      console.warn('Erro ao inserir inscricao no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha ao salvar inscrição:', err);
  }

  const inscricao: Inscricao = {
    id: idValido,
    evento_id: dados.evento_id,
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    nascimento: dados.nascimento || null,
    idade: dados.idade ? Number(dados.idade) : null,
    nome_responsavel: dados.nome_responsavel || null,
    telefone_responsavel: dados.telefone_responsavel || null,
    email_responsavel: dados.email_responsavel || null,
    rede_participante: dados.rede_participante || null,
    endereco: dados.endereco || null,
    participa_celula: dados.participa_celula,
    nome_celula_lider: dados.nome_celula_lider || null,
    observacoes_saude: dados.observacoes_saude || null,
    status: dados.status,
    metodo_pag: (dados.metodo_pag === 'pendente' ? 'balcao' : dados.metodo_pag) as MetodoPagamento,
    comprovante_hash: dados.codigo_inscricao,
    comprovante_url: dados.comprovante_url,
    created_at: new Date().toISOString(),
    evento: {
      nome: dados.evento_nome || 'Evento Eira Church',
      categoria: 'Outro',
      rede: (dados.rede_participante === 'Hype' || dados.rede_participante === 'One Way'
        ? dados.rede_participante
        : 'Padrão') as 'Hype' | 'One Way' | 'Padrão',
      valor: dados.valor_pago,
    },
  };

  const lista = carregarInscricoesLocal();
  lista.unshift(inscricao);
  salvarInscricoesLocal(lista);

  return inscricao;
}

/**
 * Atualiza o status de pagamento de uma inscrição no Supabase e no LocalStorage.
 */
export async function atualizarStatusInscricaoSupabase(
  inscricaoId: string,
  novoStatus: StatusInscricao,
  metodo?: MetodoPagamento
): Promise<void> {
  try {
    await supabase
      .from('inscricoes')
      .update({
        status: novoStatus,
        metodo_pagamento: metodo || 'dinheiro',
        data_pagamento: novoStatus === 'pago' ? new Date().toISOString() : null,
      })
      .eq('id', inscricaoId);
  } catch (err) {
    console.warn('Erro ao atualizar status da inscrição no Supabase:', err);
  }

  // Atualiza LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem('eira_inscricoes');
      if (salvos) {
        const lista: Inscricao[] = JSON.parse(salvos);
        const atualizadas = lista.map((i) =>
          i.id === inscricaoId
            ? { ...i, status: novoStatus, metodo_pag: metodo || i.metodo_pag }
            : i
        );
        localStorage.setItem('eira_inscricoes', JSON.stringify(atualizadas));
      }
    } catch {}
  }
}

export function carregarInscricoesLocal(): Inscricao[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem('eira_inscricoes');
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

export function salvarInscricoesLocal(lista: Inscricao[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('eira_inscricoes', JSON.stringify(lista));
  } catch {}
}

/**
 * ============================================================================
 * SINCRONIZAÇÃO COMPLETA DE CÉLULAS E LÍDERES NO SUPABASE
 * ============================================================================
 */
export async function buscarCelulasSupabase(): Promise<Celula[]> {
  try {
    const { data, error } = await supabase
      .from('celulas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar celulas no Supabase:', error.message);
      return carregarCelulasLocal();
    }

    if (data && data.length > 0) {
      const mapeadas: Celula[] = data.map((row: any) => {
        let meta: any = {};
        if (row.anfitriao && typeof row.anfitriao === 'string' && row.anfitriao.trim().startsWith('{')) {
          try {
            meta = JSON.parse(row.anfitriao);
          } catch {}
        }

        const membros: CelulaMembro[] = Array.isArray(meta.membros) && meta.membros.length > 0
          ? meta.membros
          : [
              {
                id: `m-lider-${row.id}`,
                nome: row.lider_nome,
                telefone: row.lider_telefone || '',
                tempo_celula: '1 ano+',
                batizado: true,
                funcao: 'Líder',
              },
            ];

        return {
          id: row.id,
          nome: row.nome,
          rede: (row.rede as any) || 'Hype',
          lider_nome: row.lider_nome,
          lider_telefone: row.lider_telefone || '',
          vice_lider_nome: meta.viceLider || row.vice_lider_nome || undefined,
          anfitriao_nome: meta.anfitriao || (!row.anfitriao?.startsWith('{') ? row.anfitriao : undefined),
          dia_semana: row.dia_semana || 'Quinta-feira',
          horario: row.horario || '20h00',
          bairro: row.bairro || 'Joinville',
          endereco: row.endereco_completo || row.bairro || 'Joinville',
          maps_url: meta.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(row.endereco_completo || row.bairro || 'Joinville')}`,
          membros,
        };
      });

      salvarCelulasLocal(mapeadas);
      return mapeadas;
    }

    return carregarCelulasLocal();
  } catch (err) {
    console.warn('Falha na busca de celulas:', err);
    return carregarCelulasLocal();
  }
}

export async function salvarCelulaSupabase(dados: {
  nome: string;
  rede: string;
  lider_nome: string;
  lider_telefone: string;
  vice_lider_nome?: string;
  anfitriao_nome?: string;
  dia_semana: string;
  horario: string;
  bairro: string;
  endereco: string;
  maps_url?: string;
  membros?: CelulaMembro[];
  usuarioAcesso?: string;
  senhaAcesso?: string;
  role?: string;
}): Promise<Celula> {
  const idValido = garantirUUID();

  const meta = {
    usuario: dados.usuarioAcesso || null,
    senha: dados.senhaAcesso || null,
    role: dados.role || 'lider_celula',
    viceLider: dados.vice_lider_nome || null,
    anfitriao: dados.anfitriao_nome || null,
    mapsUrl: dados.maps_url || null,
    membros: dados.membros && dados.membros.length > 0 ? dados.membros : [
      {
        id: `m-lider-${idValido}`,
        nome: dados.lider_nome.trim(),
        telefone: dados.lider_telefone.trim(),
        tempo_celula: '1 ano+',
        batizado: true,
        funcao: 'Líder',
      },
    ],
  };

  try {
    const { error } = await supabase.from('celulas').insert({
      id: idValido,
      nome: dados.nome.trim(),
      lider_nome: dados.lider_nome.trim(),
      lider_telefone: dados.lider_telefone.trim(),
      lider_user_id: null,
      rede: dados.rede || 'Hype',
      dia_semana: dados.dia_semana || 'Quinta-feira',
      horario: dados.horario || '20h00',
      bairro: dados.bairro.trim() || 'Centro',
      endereco_completo: dados.endereco.trim() || `${dados.bairro}, Joinville`,
      anfitriao: JSON.stringify(meta),
      ativa: true,
      capacidade_maxima: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Erro ao inserir celula no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha de rede ao salvar célula no Supabase:', err);
  }

  const celulaCriada: Celula = {
    id: idValido,
    nome: dados.nome,
    rede: dados.rede as any,
    lider_nome: dados.lider_nome,
    lider_telefone: dados.lider_telefone,
    vice_lider_nome: dados.vice_lider_nome,
    anfitriao_nome: dados.anfitriao_nome,
    dia_semana: dados.dia_semana,
    horario: dados.horario,
    bairro: dados.bairro,
    endereco: dados.endereco,
    maps_url: dados.maps_url || '',
    membros: meta.membros as CelulaMembro[],
  };

  const listaLocal = carregarCelulasLocal();
  listaLocal.unshift(celulaCriada);
  salvarCelulasLocal(listaLocal);

  return celulaCriada;
}

export async function atualizarCelulaSupabase(
  celulaId: string,
  atualizacoes: Partial<Celula> & {
    usuarioAcesso?: string;
    senhaAcesso?: string;
    role?: string;
  }
): Promise<void> {
  const listaLocal = carregarCelulasLocal();
  const celAtual = listaLocal.find((c) => c.id === celulaId);
  const celulaMesclada = { ...(celAtual || {}), ...atualizacoes } as Celula;

  let metaExistente: any = {};
  if (celAtual?.anfitriao_nome && celAtual.anfitriao_nome.startsWith('{')) {
    try {
      metaExistente = JSON.parse(celAtual.anfitriao_nome);
    } catch {}
  }

  const meta = {
    ...metaExistente,
    usuario:
      atualizacoes.usuarioAcesso !== undefined
        ? atualizacoes.usuarioAcesso
        : metaExistente.usuario || null,
    senha:
      atualizacoes.senhaAcesso !== undefined
        ? atualizacoes.senhaAcesso
        : metaExistente.senha || null,
    role:
      atualizacoes.role !== undefined
        ? atualizacoes.role
        : metaExistente.role || 'lider_celula',
    viceLider: celulaMesclada.vice_lider_nome || metaExistente.viceLider || null,
    anfitriao:
      celulaMesclada.anfitriao_nome && !celulaMesclada.anfitriao_nome.startsWith('{')
        ? celulaMesclada.anfitriao_nome
        : metaExistente.anfitriao || null,
    mapsUrl: celulaMesclada.maps_url || metaExistente.mapsUrl || null,
    membros: celulaMesclada.membros || metaExistente.membros || [],
  };

  celulaMesclada.anfitriao_nome = JSON.stringify(meta);

  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (atualizacoes.nome) payload.nome = atualizacoes.nome;
    if (atualizacoes.lider_nome) payload.lider_nome = atualizacoes.lider_nome;
    if (atualizacoes.lider_telefone) payload.lider_telefone = atualizacoes.lider_telefone;
    if (atualizacoes.rede) payload.rede = atualizacoes.rede;
    if (atualizacoes.dia_semana) payload.dia_semana = atualizacoes.dia_semana;
    if (atualizacoes.horario) payload.horario = atualizacoes.horario;
    if (atualizacoes.bairro) payload.bairro = atualizacoes.bairro;
    if (atualizacoes.endereco) payload.endereco_completo = atualizacoes.endereco;
    payload.anfitriao = JSON.stringify(meta);

    const { error } = await supabase.from('celulas').update(payload).eq('id', celulaId);
    if (error) {
      console.warn('Erro ao atualizar celula no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha de rede ao atualizar celula no Supabase:', err);
  }

  const idx = listaLocal.findIndex((c) => c.id === celulaId);
  if (idx >= 0) {
    listaLocal[idx] = celulaMesclada;
    salvarCelulasLocal(listaLocal);
  }
}

/**
 * Atualiza ou promove a função de uma pessoa na igreja (Líder de 12 / Rede, Líder de Célula, Pastor, Admin, Membro).
 * Sincroniza células, contas de liderança e metadados no Supabase e LocalStorage.
 */
export async function atualizarFuncaoLiderSupabase(dados: {
  pessoaNome: string;
  telefone?: string | null;
  email?: string | null;
  novaFuncao: 'admin' | 'pastor' | 'lider_12' | 'lider_celula' | 'lider' | 'conexao' | 'membro';
  celulaId?: string;
  rede?: string;
  celulaNome?: string;
  novoUsuario?: string;
  novaSenha?: string;
}): Promise<void> {
  const nomeLimpo = dados.pessoaNome.trim();
  const nomeLower = nomeLimpo.toLowerCase();

  // 1. Atualiza células vinculadas a esta pessoa
  const celulas = carregarCelulasLocal();
  let celulaAtualizada = false;

  for (const cel of celulas) {
    const isLiderDaCelula = cel.lider_nome.trim().toLowerCase() === nomeLower;
    const isCelulaAlvo = dados.celulaId ? cel.id === dados.celulaId : false;

    if (isLiderDaCelula || isCelulaAlvo) {
      await atualizarCelulaSupabase(cel.id, {
        role: dados.novaFuncao === 'membro' ? 'membro' : dados.novaFuncao,
        usuarioAcesso: dados.novoUsuario,
        senhaAcesso: dados.novaSenha,
        rede: dados.rede ? (dados.rede as any) : cel.rede,
      });
      celulaAtualizada = true;
    }

    // Se a pessoa estiver na lista de membros da célula
    if (Array.isArray(cel.membros)) {
      const idxMembro = cel.membros.findIndex(
        (m) => m.nome.trim().toLowerCase() === nomeLower
      );
      if (idxMembro >= 0) {
        const novosMembros = [...cel.membros];
        const membroAntigo = novosMembros[idxMembro];
        novosMembros[idxMembro] = {
          ...membroAntigo,
          funcao:
            dados.novaFuncao === 'lider_12' || dados.novaFuncao === 'lider_celula'
              ? 'Líder'
              : dados.novaFuncao === 'pastor' || dados.novaFuncao === 'admin'
              ? 'Líder'
              : 'Membro',
        };
        await atualizarCelulaSupabase(cel.id, { membros: novosMembros });
      }
    }
  }

  // 2. Se for promovida e não possuir registro ministerial prévio, cria entrada no Supabase
  if (dados.novaFuncao !== 'membro' && !celulaAtualizada) {
    const nomeGrupo =
      dados.novaFuncao === 'conexao'
        ? 'Equipe Conexão // Acolhimento'
        : dados.novaFuncao === 'lider_12'
        ? `Rede 12 // ${nomeLimpo}`
        : dados.novaFuncao === 'lider_celula'
        ? (dados.celulaNome || `Célula ${nomeLimpo}`)
        : dados.novaFuncao === 'pastor'
        ? 'Corpo Pastoral Eira'
        : 'Administração Geral';

    await salvarCelulaSupabase({
      nome: nomeGrupo,
      rede: dados.novaFuncao === 'conexao' ? 'Conexão' : ((dados.rede as any) || 'Geral'),
      lider_nome: nomeLimpo,
      lider_telefone: dados.telefone || '',
      dia_semana: 'Domingo',
      horario: '19h00',
      bairro: 'Joinville',
      endereco: 'Eira Church',
      maps_url: 'https://maps.google.com/?q=Joinville+-+SC',
      usuarioAcesso: dados.novoUsuario,
      senhaAcesso: dados.novaSenha || 'eira@1212',
      role: dados.novaFuncao,
    });
  }

  // 3. Atualiza inscrições vinculadas a esta pessoa para refletir o papel imediatamente
  try {
    const { data: inscricoesEncontradas } = await supabase
      .from('inscricoes')
      .select('id, cpf')
      .ilike('nome', `%${nomeLimpo}%`);

    if (inscricoesEncontradas && inscricoesEncontradas.length > 0) {
      for (const inscRow of inscricoesEncontradas) {
        let cpfMeta: any = {};
        if (inscRow.cpf && typeof inscRow.cpf === 'string' && inscRow.cpf.trim().startsWith('{')) {
          try {
            cpfMeta = JSON.parse(inscRow.cpf);
          } catch {}
        }
        cpfMeta.role = dados.novaFuncao;
        if (dados.novoUsuario) cpfMeta.usuario = dados.novoUsuario;
        if (dados.novaSenha) cpfMeta.senha = dados.novaSenha;

        await supabase
          .from('inscricoes')
          .update({ cpf: JSON.stringify(cpfMeta) })
          .eq('id', inscRow.id);
      }
    }
  } catch {}

  // 4. Atualiza conta de liderança no LocalStorage (eira_lideres)
  if (typeof window !== 'undefined') {
    try {
      const lideresSalvos: any[] = JSON.parse(
        localStorage.getItem('eira_lideres') || '[]'
      );
      const idx = lideresSalvos.findIndex(
        (l) => l.nome.trim().toLowerCase() === nomeLower
      );

      if (dados.novaFuncao === 'membro') {
        const filtrados = lideresSalvos.filter(
          (l) => l.nome.trim().toLowerCase() !== nomeLower
        );
        localStorage.setItem('eira_lideres', JSON.stringify(filtrados));
      } else {
        const usuarioValido =
          dados.novoUsuario ||
          nomeLimpo
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '.');

        const contaAtualizada = {
          id: idx >= 0 ? lideresSalvos[idx].id : `lid-${Date.now()}`,
          nome: nomeLimpo,
          usuarioOuEmail: usuarioValido,
          senha: dados.novaSenha || (idx >= 0 ? lideresSalvos[idx].senha : 'eira@1212'),
          telefone: dados.telefone || (idx >= 0 ? lideresSalvos[idx].telefone : ''),
          celulaNome: dados.novaFuncao === 'conexao' ? '' : (dados.celulaNome || (idx >= 0 ? lideresSalvos[idx].celulaNome : 'Célula Eira')),
          rede: dados.novaFuncao === 'conexao' ? 'Conexão' : (dados.rede || (idx >= 0 ? lideresSalvos[idx].rede : 'Geral')),
          role: dados.novaFuncao,
          criadoEm: idx >= 0 ? lideresSalvos[idx].criadoEm : new Date().toISOString(),
        };

        if (idx >= 0) {
          lideresSalvos[idx] = contaAtualizada;
        } else {
          lideresSalvos.unshift(contaAtualizada);
        }
        localStorage.setItem('eira_lideres', JSON.stringify(lideresSalvos));
      }
    } catch {}
  }
}

/**
 * Atualiza a senha de um usuário no Supabase e no LocalStorage.
 */
export async function atualizarSenhaUsuarioSupabase(
  nomeOuUsuario: string,
  novaSenha: string
): Promise<boolean> {
  const termo = nomeOuUsuario.trim().toLowerCase();
  let sucesso = false;

  // 1. Atualiza no LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const salvos: any[] = JSON.parse(localStorage.getItem('eira_lideres') || '[]');
      let modificado = false;
      const atualizados = salvos.map((l) => {
        if (
          l.nome?.toLowerCase().trim() === termo ||
          l.usuarioOuEmail?.toLowerCase().trim() === termo
        ) {
          modificado = true;
          return { ...l, senha: novaSenha };
        }
        return l;
      });
      if (modificado) {
        localStorage.setItem('eira_lideres', JSON.stringify(atualizados));
        sucesso = true;
      }
    } catch {}
  }

  // 2. Atualiza em celulas no Supabase
  try {
    const { data: celulasDB } = await supabase.from('celulas').select('id, anfitriao, lider_nome');
    if (celulasDB && celulasDB.length > 0) {
      for (const c of celulasDB) {
        let meta: any = {};
        if (c.anfitriao && typeof c.anfitriao === 'string' && c.anfitriao.trim().startsWith('{')) {
          try {
            meta = JSON.parse(c.anfitriao);
          } catch {}
        }
        const bateNome = c.lider_nome?.toLowerCase().trim() === termo;
        const bateUser = meta.usuario?.toLowerCase().trim() === termo;
        if (bateNome || bateUser) {
          meta.senha = novaSenha;
          await supabase.from('celulas').update({ anfitriao: JSON.stringify(meta) }).eq('id', c.id);
          sucesso = true;
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao atualizar senha em celulas:', e);
  }

  // 3. Atualiza em inscricoes no Supabase
  try {
    const { data: inscsDB } = await supabase.from('inscricoes').select('id, cpf, nome');
    if (inscsDB && inscsDB.length > 0) {
      for (const i of inscsDB) {
        let meta: any = {};
        if (i.cpf && typeof i.cpf === 'string' && i.cpf.trim().startsWith('{')) {
          try {
            meta = JSON.parse(i.cpf);
          } catch {}
        }
        const bateNome = i.nome?.toLowerCase().trim() === termo;
        const bateUser = meta.usuario?.toLowerCase().trim() === termo;
        if (bateNome || bateUser) {
          meta.senha = novaSenha;
          await supabase.from('inscricoes').update({ cpf: JSON.stringify(meta) }).eq('id', i.id);
          sucesso = true;
        }
      }
    }
  } catch (e) {
    console.warn('Erro ao atualizar senha em inscricoes:', e);
  }

  return sucesso;
}

export async function removerCelulaSupabase(celulaId: string): Promise<void> {
  try {
    await supabase.from('celulas').delete().eq('id', celulaId);
  } catch (err) {
    console.warn('Erro ao deletar celula no Supabase:', err);
  }

  const listaLocal = carregarCelulasLocal().filter((c) => c.id !== celulaId);
  salvarCelulasLocal(listaLocal);
}

export function carregarCelulasLocal(): Celula[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem('eira_celulas');
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

export function salvarCelulasLocal(lista: Celula[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('eira_celulas', JSON.stringify(lista));
  } catch {}
}

/**
 * ============================================================================
 * SINCRONIZAÇÃO COMPLETA DE VISITANTES (CONEXÃO) NO SUPABASE
 * ============================================================================
 */
export async function buscarVisitantesSupabase(): Promise<VisitanteConexao[]> {
  try {
    const { data, error } = await supabase
      .from('visitantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar visitantes no Supabase:', error.message);
      return carregarVisitantesLocal();
    }

    if (data && data.length > 0) {
      const mapeados: VisitanteConexao[] = data.map((row: any) => ({
        id: row.id,
        nome: row.nome,
        telefone: row.whatsapp || '',
        sexo: (row.sexo as any) || 'Homem',
        bairro: row.bairro || 'Joinville',
        endereco: row.endereco || undefined,
        maps_url: row.maps_url || undefined,
        data_visita: row.data_primeira_visita || row.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        quem_convidou: row.como_conheceu || 'Culto da Igreja',
        faixa_etaria: (row.idade as any) || 'Jovem (18-29)',
        pedido_oracao: row.pedido_oracao || undefined,
        status: (row.status_contato as any) || 'novo',
        observacoes: row.observacoes || undefined,
        quer_celula: true,
      }));

      salvarVisitantesLocal(mapeados);
      return mapeados;
    }

    return carregarVisitantesLocal();
  } catch (err) {
    console.warn('Falha na busca de visitantes:', err);
    return carregarVisitantesLocal();
  }
}

export async function salvarVisitanteSupabase(vis: Omit<VisitanteConexao, 'id'>): Promise<VisitanteConexao> {
  const idValido = garantirUUID();

  try {
    const { error } = await supabase.from('visitantes').insert({
      id: idValido,
      nome: vis.nome.trim(),
      whatsapp: vis.telefone.trim(),
      sexo: vis.sexo,
      idade: vis.faixa_etaria || null,
      bairro: vis.bairro || 'Joinville',
      endereco: vis.endereco || null,
      maps_url: vis.maps_url || null,
      data_primeira_visita: vis.data_visita || new Date().toISOString().split('T')[0],
      como_conheceu: vis.quem_convidou || null,
      pedido_oracao: vis.pedido_oracao || null,
      status_contato: vis.status || 'novo',
      observacoes: vis.observacoes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Erro ao inserir visitante no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha ao salvar visitante:', err);
  }

  const visitanteCriado: VisitanteConexao = {
    ...vis,
    id: idValido,
  };

  const lista = carregarVisitantesLocal();
  lista.unshift(visitanteCriado);
  salvarVisitantesLocal(lista);

  return visitanteCriado;
}

export function carregarVisitantesLocal(): VisitanteConexao[] {
  if (typeof window === 'undefined') return [];
  try {
    const salvos = localStorage.getItem('eira_visitantes');
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

export function salvarVisitantesLocal(lista: VisitanteConexao[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('eira_visitantes', JSON.stringify(lista));
  } catch {}
}
