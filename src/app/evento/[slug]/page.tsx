// src/app/evento/[slug]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EventHero } from '../../../components/event/EventHero';
import { InscricaoForm } from '../../../components/form/InscricaoForm';
import { supabase } from '../../../lib/supabase';
import { Evento } from '../../../types/evento';
import { ArrowLeft, Church, Loader2 } from 'lucide-react';

export default function EventoSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;

    // 1. Tenta carregar do cache local imediatamente para exibição ultra rápida
    if (typeof window !== 'undefined') {
      try {
        const salvos = localStorage.getItem('eira_eventos');
        if (salvos) {
          const lista: Evento[] = JSON.parse(salvos);
          const encontrado = lista.find((ev) => ev.slug === slug);
          if (encontrado) {
            setEvento(encontrado);
            setLoading(false);
          }
        }
      } catch {}
    }

    // 2. Consulta no Supabase para pegar a versão oficial mais recente
    async function carregarDoSupabase() {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('slug', slug)
          .eq('ativo', true)
          .single();

        if (data && !error) {
          setEvento(data as Evento);
        }
      } catch (err) {
        console.error('Erro ao buscar evento no Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDoSupabase();
  }, [slug]);

  if (loading && !evento) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[var(--accent,#FACC15)] animate-spin" />
        <p className="text-xs text-[#A1A1AA]">Carregando informações do evento...</p>
      </div>
    );
  }

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
