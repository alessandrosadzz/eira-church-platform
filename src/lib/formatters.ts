// src/lib/formatters.ts

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarMoeda(valor: number): string {
  if (valor === 0) return 'Gratuito';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

// Alias de compatibilidade
export const formatBRL = formatarMoeda;

export function formatarData(dataString?: string | null): string {
  if (!dataString) return '';
  try {
    const data = parseISO(dataString);
    return format(data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dataString;
  }
}

export function formatarDataCurta(dataString?: string | null): string {
  if (!dataString) return '';
  try {
    const data = parseISO(dataString);
    return format(data, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dataString;
  }
}

export function formatarDataHora(dataString?: string | null): string {
  if (!dataString) return '';
  try {
    const data = parseISO(dataString);
    return format(data, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return dataString;
  }
}

export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return '';
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return telefone;
}
