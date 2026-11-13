// src/lib/slugify.ts

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function slugify(texto: string): string {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')    // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-')            // substitui espacos por hifens
    .replace(/-+/g, '-');            // remove hifens duplicados
}

export function slugifyEvento(nome: string): string {
  const agora = new Date();
  const mes = format(agora, 'MMM', { locale: ptBR }).toLowerCase();
  const ano = format(agora, 'yyyy');
  const base = slugify(nome);
  return `${base}-${mes}-${ano}`;
}
