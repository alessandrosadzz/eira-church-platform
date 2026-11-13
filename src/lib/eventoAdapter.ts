// src/lib/eventoAdapter.ts

import { supabase } from './supabase';
import { Evento, CategoriaEvento } from '../types/evento';
import { Inscricao, MetodoPagamento, StatusInscricao } from '../types/inscricao';

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
 * Busca todos os eventos cadastrados no Supabase, mesclando com o cache local.
 */
export async function buscarEventosSupabase(): Promise<Evento[]> {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao buscar eventos do Supabase:', error.message);
      return carregarEventosLocal();
    }

    if (data && data.length > 0) {
      const mapeados: Evento[] = data.map((row: any) => ({
        id: row.id,
        nome: row.nome,
        slug: row.slug,
        descricao: row.descricao || '',
        data_inicio: row.data_inicio,
        data_fim: row.data_fim,
        local_nome: row.local || 'Eira Church',
        valor: Number(row.preco || 0),
        vagas: Number(row.limite_vagas || 100),
        imagem_url: row.imagem_url || undefined,
        ativo: row.ativo !== false,
        categoria: (row.categoria as CategoriaEvento) || 'Outro',
        rede: 'Padrão',
        campos: ['nome', 'telefone', 'email', 'nascimento'],
        total_inscritos: 0,
        inscritos_confirmados: 0,
        vagas_restantes: Number(row.limite_vagas || 100),
        receita_confirmada: 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

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

  const payloadDB = {
    id: idValido,
    nome: evento.nome?.trim() || 'Evento Eira Church',
    slug: slugValido,
    descricao: evento.descricao?.trim() || '',
    data_inicio: evento.data_inicio || new Date().toISOString(),
    data_fim: evento.data_fim || null,
    local: evento.local_nome?.trim() || 'Eira Church Joinville',
    preco: Number(evento.valor || 0),
    limite_vagas: Number(evento.vagas || 100),
    imagem_url: evento.imagem_url?.trim() || null,
    ativo: evento.ativo !== false,
    categoria: normalizarCategoriaDB(evento.categoria || 'Outro'),
    destaque: true,
    updated_at: new Date().toISOString(),
  };

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
    rede: evento.rede || 'Padrão',
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
    return salvos ? JSON.parse(salvos) : [];
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
  if (typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem('eira_comprovantes_map');
      if (salvos) Object.assign(comprovantesMap, JSON.parse(salvos));
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
      const mapeadas: Inscricao[] = data.map((row: any) => ({
        id: row.id,
        evento_id: row.evento_id,
        nome: row.nome,
        email: row.email || undefined,
        telefone: row.telefone,
        status: (row.status as StatusInscricao) || 'pendente',
        metodo_pag: (row.metodo_pagamento as MetodoPagamento) || 'pix',
        comprovante_hash: row.codigo_inscricao,
        comprovante_url: comprovantesMap[row.codigo_inscricao] || comprovantesMap[row.id] || null,
        created_at: row.data_inscricao || row.created_at,
        evento: {
          nome: row.evento?.nome || 'Evento Geral',
          categoria: row.evento?.categoria || 'Outro',
          rede: 'Padrão',
          valor: Number(row.evento?.preco || row.valor_pago || 0),
        },
      }));

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
  idade?: number | string | null;
  telefone_responsavel?: string | null;
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

  // Salva comprovante no mapa local
  if (dados.comprovante_url && typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem('eira_comprovantes_map');
      const mapa = salvos ? JSON.parse(salvos) : {};
      mapa[dados.codigo_inscricao] = dados.comprovante_url;
      mapa[idValido] = dados.comprovante_url;
      localStorage.setItem('eira_comprovantes_map', JSON.stringify(mapa));
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
    idade: dados.idade ? Number(dados.idade) : null,
    telefone_responsavel: dados.telefone_responsavel || null,
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
      rede: 'Padrão',
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
