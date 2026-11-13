// src/lib/campos.ts

import { CampoDisponivel } from '../types/evento';

export interface CampoDefinicao {
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'checkbox' | 'textarea';
  obrigatorio: boolean;
  placeholder?: string;
  ajuda?: string;
}

export const CAMPO_CONFIG: Record<CampoDisponivel, CampoDefinicao> = {
  nome: {
    label: 'Nome completo',
    type: 'text',
    obrigatorio: true,
    placeholder: 'Seu nome completo',
  },
  email: {
    label: 'E-mail para envio de comprovante',
    type: 'email',
    obrigatorio: false,
    placeholder: 'seu@email.com',
  },
  telefone: {
    label: 'WhatsApp / Telefone com DDD',
    type: 'tel',
    obrigatorio: true,
    placeholder: '(00) 00000-0000',
    ajuda: 'Usado para avisos importantes e confirmação de presença.',
  },
  nascimento: {
    label: 'Data de nascimento',
    type: 'date',
    obrigatorio: true,
    ajuda: 'Participantes menores de 18 anos precisam informar dados do responsável.',
  },
  nome_responsavel: {
    label: 'Nome completo do Pai / Mãe ou Responsável Legal',
    type: 'text',
    obrigatorio: true,
    placeholder: 'Nome do responsável',
  },
  telefone_responsavel: {
    label: 'WhatsApp do Responsável para contato de emergência',
    type: 'tel',
    obrigatorio: true,
    placeholder: '(00) 00000-0000',
  },
  email_responsavel: {
    label: 'E-mail do Responsável (Opcional)',
    type: 'email',
    obrigatorio: false,
    placeholder: 'responsavel@email.com',
    ajuda: 'Para envio de autorização e cópia do comprovante.',
  },
  observacoes_saude: {
    label: 'Restrições alimentares, alergias ou cuidados médicos',
    type: 'textarea',
    obrigatorio: false,
    placeholder: 'Ex: intolerância a lactose, alergia a amendoim, medicamento contínuo...',
    ajuda: 'Essas informações são confidenciais e repassadas à equipe de apoio e alimentação.',
  },
  igreja: {
    label: 'Igreja / Congregação de origem',
    type: 'text',
    obrigatorio: false,
    placeholder: 'Ex: Eira Church ou visitante',
  },
  transporte: {
    label: 'Precisa de transporte / ônibus da igreja para o retiro?',
    type: 'checkbox',
    obrigatorio: false,
  },
  participa_celula: {
    label: 'Já frequenta alguma célula da Eira Church?',
    type: 'checkbox',
    obrigatorio: false,
  },
  nome_celula_lider: {
    label: 'Nome do seu líder de célula ou bairro onde mora',
    type: 'text',
    obrigatorio: false,
    placeholder: 'Ex: Célula Centro - Pr. Lucas ou seu bairro',
  },
};
