'use client';

// src/components/event/EventCard.tsx

import React from 'react';
import { Evento } from '../../types/evento';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export interface EventCardProps {
  evento: Evento;
  onInscrever: (evento: Evento) => void;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  evento,
  onInscrever,
  featured = false,
}) => {
  const vagas = evento.vagas;
  const inscritos = evento.inscritos_confirmados ?? 0;
  const vagasRestantes = evento.vagas_restantes ?? Math.max(vagas - inscritos, 0);
  const esgotado = vagasRestantes <= 0;

  return (
    <article
      className={`group bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5 ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {/* Banner 16:9 */}
      <div className="relative w-full aspect-video bg-[#0A0A0A] overflow-hidden">
        {evento.imagem_url ? (
          <img
            src={evento.imagem_url}
            alt={`Banner do evento ${evento.nome}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#18181B] text-[var(--accent,#FACC15)] font-black text-2xl tracking-tighter">
            EIRA CHURCH // {evento.rede.toUpperCase()}
          </div>
        )}

        {/* Tags de Rede e Categoria */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-xs font-black bg-black text-[var(--accent,#FACC15)] border border-black tracking-tight shadow-sm">
            {evento.rede.toUpperCase()}
          </span>
          <Badge categoria={evento.categoria} />
        </div>

        {/* Preço em destaque sobre o banner */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-3 py-1 rounded-lg text-sm font-extrabold bg-white/95 text-[#0A0A0A] border border-[#E4E4E7] shadow-sm tabular-nums">
            {formatarMoeda(evento.valor)}
          </span>
        </div>
      </div>

      {/* Conteudo do Card */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 text-left">
          <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A] group-hover:text-[#CA8A04] transition-colors line-clamp-2">
            {evento.nome}
          </h3>

          {/* Metadados de Data e Local */}
          <div className="space-y-1 text-xs text-[#52525B]">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#71717A] shrink-0" aria-hidden="true" />
              <span>
                {formatarDataCurta(evento.data_inicio)}
                {evento.data_fim && ` até ${formatarDataCurta(evento.data_fim)}`}
              </span>
            </div>
            {evento.local_nome && (
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#71717A] shrink-0" aria-hidden="true" />
                <span className="truncate">{evento.local_nome}</span>
              </div>
            )}
          </div>

          {/* Descricao Adaptativa (sem buracos se vazia) */}
          {evento.descricao && (
            <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed pt-1">
              {evento.descricao}
            </p>
          )}
        </div>

        {/* Rodapé com Vagas e Ação */}
        <div className="pt-2 border-t border-[#F4F4F5] space-y-3">
          <ProgressBar valorAtual={inscritos} valorMaximo={vagas} />

          <Button
            variant={esgotado ? 'secondary' : 'primary'}
            fullWidth
            disabled={esgotado}
            onClick={() => onInscrever(evento)}
            aria-label={
              esgotado
                ? `Inscrições esgotadas para ${evento.nome}`
                : `Fazer inscrição em ${evento.nome}`
            }
          >
            {esgotado ? (
              'Inscrições Esgotadas'
            ) : (
              <span className="flex items-center justify-center space-x-1.5">
                <span>Garantir Vaga</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
};
