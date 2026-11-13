'use client';

// src/components/ui/Badge.tsx

import React from 'react';
import { StatusInscricao, MetodoPagamento } from '../../types/inscricao';
import { CategoriaEvento } from '../../types/evento';
import { CATEGORIA_CONFIG } from '../../lib/categorias';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'pago' | 'pendente' | 'isento' | 'danger';
  categoria?: CategoriaEvento;
  status?: StatusInscricao;
  metodo?: MetodoPagamento | null;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  categoria,
  status,
  metodo,
  className = '',
}) => {
  // 1. Se for badge de status de inscricao
  if (status) {
    const statusMap = {
      pago: {
        bg: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
        label: '✓ Pago',
      },
      pendente: {
        bg: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
        label: '⏳ Pendente',
      },
      isento: {
        bg: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
        label: '★ Isento',
      },
    }[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border tracking-tight ${statusMap.bg} ${className}`}
      >
        {children || statusMap.label}
      </span>
    );
  }

  // 2. Se for badge de metodo de pagamento
  if (metodo) {
    const metodoMap = {
      pix: { label: 'Pix', bg: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]' },
      cartao: { label: 'Cartão', bg: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]' },
      boleto: { label: 'Boleto', bg: 'bg-[#F4F4F5] text-[#3F3F46] border-[#E4E4E7]' },
      dinheiro: { label: 'Dinheiro (Secretaria)', bg: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' },
      balcao: { label: 'Balcão', bg: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' },
      isento: { label: 'Gratuito', bg: 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]' },
    }[metodo];

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${metodoMap.bg} ${className}`}
      >
        {children || metodoMap.label}
      </span>
    );
  }

  // 3. Se for badge de categoria
  if (categoria && CATEGORIA_CONFIG[categoria]) {
    const config = CATEGORIA_CONFIG[categoria];
    return (
      <span
        style={{
          backgroundColor: config.corLight,
          color: config.corTexto,
          borderColor: config.cor,
        }}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-opacity-40 tracking-tight ${className}`}
      >
        {children || config.label}
      </span>
    );
  }

  const variantStyles = {
    default: 'bg-[#0A0A0A] text-white border-black',
    outline: 'bg-white text-[#0A0A0A] border-[#E4E4E7]',
    pago: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    pendente: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
    isento: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-tight ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
