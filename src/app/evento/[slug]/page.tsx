// src/app/evento/[slug]/page.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EventHero } from '../../../components/event/EventHero';
import { InscricaoForm } from '../../../components/form/InscricaoForm';
import { SEED_EVENTOS } from '../../../lib/supabase';
import { ArrowLeft, Church } from 'lucide-react';

export default function EventoSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const evento = useMemo(() => {
    return SEED_EVENTOS.find((ev) => ev.slug === slug);
  }, [slug]);

  if (!evento) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center">
          <Church className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">Evento não encontrado</h1>
        <p className="text-sm text-[#71717A] max-w-sm">
          O link acessado pode ter sido alterado ou o evento foi encerrado.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-[var(--radius-btn,0.5rem)] bg-black text-[var(--accent,#FACC15)] font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página inicial</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Barra de Navegacao Superior */}
      <nav className="w-full bg-[#0A0A0A] border-b border-[#27272A] py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--accent,#FACC15)]" aria-hidden="true" />
            <span>Todos os eventos da Eira Church</span>
          </Link>

          <span className="text-[11px] font-black tracking-wider text-[var(--accent,#FACC15)] uppercase">
            LINK DIRETO DE INSCRIÇÃO
          </span>
        </div>
      </nav>

      {/* Hero do Evento */}
      <EventHero evento={evento} />

      {/* Container Centralizado do Formulario (Levitando sobre o Hero) */}
      <div className="max-w-xl mx-auto w-full px-4 -mt-12 z-20 pb-20">
        <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-modal p-6 sm:p-8">
          <InscricaoForm evento={evento} />
        </div>

        <div className="text-center pt-6">
          <Link
            href="/"
            className="text-xs text-[#71717A] hover:text-black font-semibold transition-colors"
          >
            ← Voltar para a programação completa de eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
