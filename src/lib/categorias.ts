// src/lib/categorias.ts

import { CategoriaEvento } from '../types/evento';

export interface CategoriaMeta {
  label: string;
  cor: string;
  corLight: string;
  corTexto: string;
  redePadrao: 'Hype' | 'One Way' | 'Padrão';
}

export const CATEGORIA_CONFIG: Record<CategoriaEvento, CategoriaMeta> = {
  Hype: {
    label: 'Rede Hype // Teens',
    cor: '#FACC15',
    corLight: '#FEF9C3',
    corTexto: '#854D0E',
    redePadrao: 'Hype',
  },
  'One Way': {
    label: 'Rede One Way // Jovens',
    cor: '#2563EB',
    corLight: '#EFF6FF',
    corTexto: '#1E40AF',
    redePadrao: 'One Way',
  },
  Padrão: {
    label: 'Geral & Famílias',
    cor: '#0A0A0A',
    corLight: '#F4F4F5',
    corTexto: '#18181B',
    redePadrao: 'Padrão',
  },
  Acampamento: {
    label: 'Acampamento & Retiro',
    cor: '#D97706',
    corLight: '#FEF3C7',
    corTexto: '#92400E',
    redePadrao: 'Padrão',
  },
  Conferência: {
    label: 'Conferência Oficial',
    cor: '#4F46E5',
    corLight: '#EEF2FF',
    corTexto: '#3730A3',
    redePadrao: 'One Way',
  },
  Encontro: {
    label: 'Encontro Especial',
    cor: '#059669',
    corLight: '#ECFDF5',
    corTexto: '#065F46',
    redePadrao: 'Padrão',
  },
  'Culto especial': {
    label: 'Culto Especial',
    cor: '#7C3AED',
    corLight: '#F5F3FF',
    corTexto: '#5B21B6',
    redePadrao: 'Padrão',
  },
  Outro: {
    label: 'Outro Evento',
    cor: '#71717A',
    corLight: '#F4F4F5',
    corTexto: '#3F3F46',
    redePadrao: 'Padrão',
  },
};
