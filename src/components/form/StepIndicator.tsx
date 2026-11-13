'use client';

// src/components/form/StepIndicator.tsx

import React from 'react';
import { Check } from 'lucide-react';

export interface StepIndicatorProps {
  etapaAtual: number;
  etapas: { numero: number; titulo: string }[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ etapaAtual, etapas }) => {
  return (
    <nav aria-label="Progresso da inscrição" className="w-full pb-4 border-b border-[#E4E4E7]">
      <ol className="flex items-center justify-between max-w-sm mx-auto">
        {etapas.map((etapa, index) => {
          const isCompleta = etapaAtual > etapa.numero;
          const isAtiva = etapaAtual === etapa.numero;

          return (
            <li key={etapa.numero} className="flex-1 flex items-center">
              <div className="flex flex-col items-center mx-auto space-y-1">
                <div
                  aria-current={isAtiva ? 'step' : undefined}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isCompleta
                      ? 'bg-black text-[var(--accent,#FACC15)] border-2 border-black'
                      : isAtiva
                      ? 'bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] border-2 border-black font-extrabold ring-2 ring-black/10'
                      : 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]'
                  }`}
                >
                  {isCompleta ? <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" /> : etapa.numero}
                </div>
                <span
                  className={`text-[11px] font-bold tracking-tight text-center ${
                    isAtiva ? 'text-[#0A0A0A]' : 'text-[#71717A]'
                  }`}
                >
                  {etapa.titulo}
                </span>
              </div>

              {index < etapas.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-colors duration-200 ${
                    etapaAtual > etapa.numero ? 'bg-black' : 'bg-[#E4E4E7]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
