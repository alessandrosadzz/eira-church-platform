'use client';

// src/components/ui/ProgressBar.tsx

import React from 'react';

export interface ProgressBarProps {
  valorAtual: number;
  valorMaximo: number;
  rotulo?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  valorAtual,
  valorMaximo,
  rotulo,
  className = '',
}) => {
  const porcentagem = Math.min(Math.round((valorAtual / (valorMaximo || 1)) * 100), 100);
  const vagasRestantes = Math.max(valorMaximo - valorAtual, 0);
  const urgenciaCritica = vagasRestantes <= Math.max(Math.round(valorMaximo * 0.1), 5) && vagasRestantes > 0;
  const esgotado = vagasRestantes === 0;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-[#71717A]">
        <span>{rotulo || 'Vagas preenchidas'}</span>
        <span className="tabular-nums">
          {esgotado ? (
            <span className="text-[#DC2626] font-bold">ESGOTADO</span>
          ) : (
            <>
              <strong className="text-[#0A0A0A]">{vagasRestantes}</strong> {vagasRestantes === 1 ? 'vaga restante' : 'vagas restantes'}
            </>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={valorAtual}
        aria-valuemin={0}
        aria-valuemax={valorMaximo}
        aria-label={`${valorAtual} de ${valorMaximo} vagas preenchidas`}
        className="w-full h-2 rounded-full bg-[#E4E4E7] overflow-hidden"
      >
        <div
          style={{ width: `${porcentagem}%` }}
          className={`h-full transition-all duration-300 rounded-full ${
            esgotado
              ? 'bg-[#991B1B]'
              : urgenciaCritica
              ? 'bg-[#EF4444]'
              : 'bg-[var(--accent,#FACC15)]'
          }`}
        />
      </div>
    </div>
  );
};
