// src/app/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { EventCard } from '../components/event/EventCard';
import { EventCardSkeleton } from '../components/event/EventCardSkeleton';
import { InscricaoModal } from '../components/form/InscricaoModal';
import { Evento } from '../types/evento';
import { supabase } from '../lib/supabase';
import { useAdminStore } from '../store/adminStore';
import { animateCardsEntrance, animateHeroEntrance } from '../lib/animations';
import {
  Search,
  Lock,
  Church,
  MapPin,
  Clock,
  Instagram,
  Phone,
  MessageCircle,
  ExternalLink,
  LogIn,
  HeartHandshake,
  Sun,
  Moon,
} from 'lucide-react';

export default function HomePage() {
  const { igrejaConfig, modoCor, setModoCor } = useAdminStore();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [busca, setBusca] = useState<string>('');
  const [redeFiltro, setRedeFiltro] = useState<'Todas' | 'Hype' | 'One Way' | 'Padrão'>('Todas');
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [modalAberto, setModalAberto] = useState<boolean>(false);

  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Carrega eventos do LocalStorage e do Supabase
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const salvos = localStorage.getItem('eira_eventos');
        if (salvos) {
          setEventos(JSON.parse(salvos));
          setLoading(false);
        }
      } catch {}
    }

    async function buscarEventos() {
      try {
        const { data, error } = await supabase
          .from('eventos')
          .select('*')
          .eq('ativo', true)
          .order('data_inicio', { ascending: true });

        if (data && !error) {
          setEventos(data as Evento[]);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('eira_eventos', JSON.stringify(data));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar eventos do Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    buscarEventos();
  }, []);

  // Animações GSAP de entrada sutis
  useEffect(() => {
    if (heroRef.current) {
      animateHeroEntrance(heroRef.current);
    }
  }, []);

  useEffect(() => {
    if (gridRef.current && gridRef.current.children.length > 0) {
      animateCardsEntrance(Array.from(gridRef.current.children));
    }
  }, [redeFiltro, busca]);

  // Filtragem dos eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      const matchBusca =
        !busca.trim() ||
        ev.nome.toLowerCase().includes(busca.toLowerCase()) ||
        ev.categoria.toLowerCase().includes(busca.toLowerCase());
      const matchRede = redeFiltro === 'Todas' || ev.rede === redeFiltro;
      return matchBusca && matchRede && ev.ativo;
    });
  }, [eventos, busca, redeFiltro]);

  const handleAbrirInscricao = (ev: Evento) => {
    setEventoSelecionado(ev);
    setModalAberto(true);
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* ==================================================== */}
      {/* 1. CABEÇALHO PÚBLICO */}
      {/* ==================================================== */}
      <header className="w-full bg-white border-b border-[#E4E4E7] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {igrejaConfig.logoUrl ? (
              <img
                src={igrejaConfig.logoUrl}
                alt={igrejaConfig.nome}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-[var(--radius-btn,0.5rem)] bg-[#0A0A0A] text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-xl border border-black shadow-sm">
                {igrejaConfig.nome.charAt(0)}
              </div>
            )}
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0A0A0A] block">
                {igrejaConfig.nome.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold text-[#71717A] tracking-wider uppercase">
                Central de Inscrições & Eventos
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/boas-vindas"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-[var(--radius-btn,0.5rem)] text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0] hover:bg-[#BBF7D0] transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Sou Visitante</span>
            </Link>

            <button
              type="button"
              onClick={() => setModoCor(modoCor === 'dark' ? 'light' : 'dark')}
              title={`Alternar para ${modoCor === 'dark' ? 'Modo Claro' : 'Modo Escuro'}`}
              className="p-2 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#0A0A0A] hover:border-black transition-colors cursor-pointer"
              aria-label="Alternar tema claro e escuro"
            >
              {modoCor === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--accent,#FACC15)]" />
              ) : (
                <Moon className="w-4 h-4 text-[#52525B]" />
              )}
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[var(--radius-btn,0.5rem)] text-xs font-bold text-[#0A0A0A] bg-[#FAFAFA] border border-[#E4E4E7] hover:border-black hover:bg-[#F4F4F5] transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Fazer login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. HERO INSTITUCIONAL // MINIMALISTA & DIRETO */}
      {/* ==================================================== */}
      <section
        ref={heroRef}
        className="w-full bg-[#0A0A0A] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] tracking-tight mb-2">
            CALENDÁRIO OFICIAL // {igrejaConfig.nome.toUpperCase()}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white leading-tight">
            Próximos Encontros, Retiros e Conferências
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#A1A1AA] leading-relaxed">
            {igrejaConfig.slogan}. Garanta sua vaga nos momentos mais transformadores da nossa congregação com confirmação instantânea.
          </p>
        </div>

        {/* Gradiente sutil de fundo com a cor do tema */}
        <div className="absolute inset-0 bg-radial from-[var(--accent,#FACC15)]/10 via-transparent to-transparent pointer-events-none" />
      </section>

      {/* ==================================================== */}
      {/* 3. FILTROS E BUSCA */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-7 w-full z-20">
        <div className="bg-white p-3 sm:p-4 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Seletor de Redes (Pills) */}
          <div className="flex items-center overflow-x-auto w-full md:w-auto space-x-1.5 no-scrollbar">
            {(['Todas', 'Hype', 'One Way', 'Padrão'] as const).map((r) => {
              const isAtivo = redeFiltro === r;
              const label =
                r === 'Todas'
                  ? 'Todos os Eventos'
                  : r === 'Padrão'
                  ? 'Geral / Família'
                  : `Rede ${r}`;

              return (
                <button
                  key={r}
                  onClick={() => setRedeFiltro(r)}
                  className={`px-4 py-2 rounded-[var(--radius-btn,0.5rem)] text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                    isAtivo
                      ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-sm'
                      : 'bg-[#FAFAFA] text-[#71717A] border border-[#E4E4E7] hover:border-[#0A0A0A]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar evento..."
              aria-label="Buscar eventos por nome"
              className="w-full h-11 pl-9 pr-3 rounded-[var(--radius-btn,0.5rem)] bg-[#FAFAFA] border border-[#E4E4E7] text-sm text-[#0A0A0A] placeholder-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. GRID DE EVENTOS */}
      {/* ==================================================== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#F4F4F5] text-[#71717A] flex items-center justify-center mx-auto">
              <Church className="w-7 h-7 text-[#71717A]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#0A0A0A]">
                Nenhum evento com inscrições abertas no momento
              </h3>
              <p className="text-xs text-[#71717A] max-w-md mx-auto">
                Em breve divulgaremos os próximos retiros, conferências e eventos oficiais da igreja. Acompanhe nossos cultos e avisos!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center space-x-2 text-xs font-bold text-black hover:underline"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acesso Liderança & Pastores →</span>
              </Link>
            </div>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {eventosFiltrados.map((evento, index) => (
              <EventCard
                key={evento.id}
                evento={evento}
                featured={index === 0 && redeFiltro === 'Todas' && !busca}
                onInscrever={handleAbrirInscricao}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==================================================== */}
      {/* 5. SEÇÃO INSTITUCIONAL: CULTOS, ENDEREÇO & CONEXÃO */}
      {/* ==================================================== */}
      <section className="w-full bg-white border-t border-[#E4E4E7] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#F4F4F5] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--accent,#EAB308)]">
                FAÇA PARTE DA COMUNIDADE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0A0A]">
                Conheça a {igrejaConfig.nome}
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] max-w-xl">
                Venha nos visitar em nossos cultos e encontros semanais. Um lugar acolhedor para você e sua família viverem o propósito de Deus.
              </p>
            </div>

            {igrejaConfig.whatsapp && (
              <a
                href={`https://wa.me/55${igrejaConfig.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-[var(--radius-btn,0.5rem)] text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar no WhatsApp da Igreja</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Horários de Cultos */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#71717A]" />
                <h3 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
                  Horários de Culto & Reuniões
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {igrejaConfig.cultos.map((culto) => (
                  <div
                    key={culto.id}
                    className="p-4 rounded-[var(--radius-box,0.75rem)] bg-[#FAFAFA] border border-[#E4E4E7] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#0A0A0A]">
                        {culto.dia}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-black text-[var(--accent,#FACC15)]">
                        {culto.horario}
                      </span>
                    </div>
                    <p className="text-xs text-[#52525B]">{culto.descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 3: Endereço & Contatos */}
            <div className="p-5 rounded-[var(--radius-box,0.75rem)] bg-[#0A0A0A] text-white flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-[var(--accent,#FACC15)]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Como Chegar
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-extrabold text-sm text-white">
                    {igrejaConfig.endereco.logradouro}
                  </p>
                  <p className="text-[#A1A1AA]">
                    {igrejaConfig.endereco.bairro} • {igrejaConfig.endereco.cidade}
                  </p>
                  <p className="text-[#71717A]">CEP: {igrejaConfig.endereco.cep}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#27272A] text-xs">
                {igrejaConfig.instagram && (
                  <div className="flex items-center space-x-2 text-[#A1A1AA]">
                    <Instagram className="w-4 h-4 text-[var(--accent,#FACC15)]" />
                    <span>{igrejaConfig.instagram}</span>
                  </div>
                )}
                {igrejaConfig.telefone && (
                  <div className="flex items-center space-x-2 text-[#A1A1AA]">
                    <Phone className="w-4 h-4 text-[var(--accent,#FACC15)]" />
                    <span>{igrejaConfig.telefone}</span>
                  </div>
                )}
              </div>

              {igrejaConfig.endereco.mapsUrl && (
                <a
                  href={igrejaConfig.endereco.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-[var(--radius-btn,0.5rem)] text-xs font-bold bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] flex items-center justify-center space-x-1.5 hover:opacity-90 transition-opacity"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 6. RODAPÉ INSTITUCIONAL */}
      {/* ==================================================== */}
      <footer className="w-full bg-[#FAFAFA] border-t border-[#E4E4E7] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#0A0A0A]">{igrejaConfig.nome}</span>
            <span>•</span>
            <span>{igrejaConfig.slogan}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/boas-vindas" className="hover:text-black transition-colors font-medium">
              Ficha do Visitante
            </Link>
            <span>•</span>
            <Link href="/cadastro-lider" className="hover:text-black transition-colors font-medium">
              Cadastro de Líder de Célula
            </Link>
            <span>•</span>
            <Link
              href="/admin"
              className="hover:text-black transition-colors font-medium flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Painel da Liderança</span>
            </Link>
            <span>•</span>
            <span>Plataforma White Label v1.2</span>
          </div>
        </div>
      </footer>

      {/* MODAL DE INSCRIÇÃO MULTI-STEP */}
      <InscricaoModal
        evento={eventoSelecionado}
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setEventoSelecionado(null);
        }}
      />
    </div>
  );
}
