'use client';

// src/components/event/EventHero.tsx

import React from 'react';
import { Evento } from '../../types/evento';
import { Badge } from '../ui/Badge';
import { formatarData, formatarMoeda } from '../../lib/formatters';
import { Calendar, MapPin, Users } from 'lucide-react';

export const EventHero: React.FC<{ evento: Evento }> = ({ evento }) => {
  const vagas = evento.vagas;
  const inscritos = evento.inscritos_confirmados ?? 0;
  const vagasRestantes = evento.vagas_restantes ?? Math.max(vagas - inscritos, 0);

  return (
    <section className="relative w-full bg-[#0A0A0A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Imagem de Fundo com Overlay Cinematografico */}
      {evento.imagem_url && (
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={evento.imagem_url}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-[#0A0A0A]/95 to-[#0A0A0A]" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center sm:text-left">
        {/* Tags de Identificacao */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] tracking-tight">
            REDE {evento.rede.toUpperCase()}
          </span>
          <Badge categoria={evento.categoria} />
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#27272A] text-white border border-[#3F3F46]">
            {formatarMoeda(evento.valor)}
          </span>
        </div>

        {/* Titulo Monumental em Manrope Extra-Bold */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-white leading-tight">
          {evento.nome}
        </h1>

        {/* Metadados */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-[#A1A1AA] pt-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[var(--accent,#FACC15)]" aria-hidden="true" />
            <span>{formatarData(evento.data_inicio)}</span>
          </div>

          {evento.local_nome && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[var(--accent,#FACC15)]" aria-hidden="true" />
              <span>{evento.local_nome}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[var(--accent,#FACC15)]" aria-hidden="true" />
            <span>
              <strong className="text-white font-bold">{vagasRestantes}</strong> vagas restantes
            </span>
          </div>
        </div>

        {/* Descricao Adaptativa */}
        {evento.descricao && (
          <p className="max-w-2xl text-base sm:text-lg text-[#D4D4D8] leading-relaxed pt-2">
            {evento.descricao}
          </p>
        )}
      </div>
    </section>
  );
};
