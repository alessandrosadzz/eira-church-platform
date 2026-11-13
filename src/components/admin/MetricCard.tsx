'use client';

// src/components/admin/MetricCard.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtexto?: string;
  icone: LucideIcon;
  destaque?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  titulo,
  valor,
  subtexto,
  icone: Icon,
  destaque = false,
}) => {
  return (
    <div
      className={`p-6 rounded-[var(--radius-box,0.75rem)] border flex flex-col justify-between transition-all duration-150 ${
        destaque
          ? 'bg-[#0A0A0A] text-white border-black shadow-[3px_3px_0px_var(--accent,#FACC15)]'
          : 'bg-white text-[#0A0A0A] border-[#E4E4E7] shadow-sm hover:border-[#A1A1AA]'
      }`}
    >
      <div className="flex items-center justify-between pb-2">
        <span
          className={`text-xs font-bold tracking-tight uppercase ${
            destaque ? 'text-[var(--accent,#FACC15)]' : 'text-[#71717A]'
          }`}
        >
          {titulo}
        </span>
        <div
          className={`p-2 rounded-lg ${
            destaque
              ? 'bg-[#27272A] text-[var(--accent,#FACC15)]'
              : 'bg-[#F4F4F5] text-[#0A0A0A]'
          }`}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">
          {valor}
        </p>
        {subtexto && (
          <p
            className={`text-xs font-medium ${
              destaque ? 'text-[#A1A1AA]' : 'text-[#71717A]'
            }`}
          >
            {subtexto}
          </p>
        )}
      </div>
    </div>
  );
};
