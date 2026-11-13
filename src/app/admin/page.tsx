// src/app/admin/page.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAdminStore, AbaAdmin } from '../../store/adminStore';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { MetricCard } from '../../components/admin/MetricCard';
import { FilterBar } from '../../components/admin/FilterBar';
import { DataTable } from '../../components/admin/DataTable';
import { BaixaManualModal } from '../../components/admin/BaixaManualModal';
import { EventoForm } from '../../components/admin/EventoForm';
import { ConexaoView } from '../../components/admin/ConexaoView';
import { CelulasView } from '../../components/admin/CelulasView';
import { ConfiguracaoIgrejaView } from '../../components/admin/ConfiguracaoIgrejaView';
import { Evento } from '../../types/evento';
import { Inscricao, MetodoPagamento } from '../../types/inscricao';
import { SEED_EVENTOS, SEED_INSCRICOES } from '../../lib/supabase';
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters';
import { exportarCsvInscricoes } from '../../lib/exportCsv';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { animateCardsEntrance, animateHeroEntrance } from '../../lib/animations';
import { gsap } from 'gsap';
import {
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  HeartHandshake,
  Home,
  Copy,
  ExternalLink,
  PlusCircle,
  Calendar,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function AdminPage() {
  const { sucesso, info } = useToast();
  const {
    abaAtiva,
    setAbaAtiva,
    filtros,
    eventoParaEditar,
    setEventoParaEditar,
    igrejaConfig,
    visitantes,
    celulas,
    usuarioRole,
  } = useAdminStore();

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Estado de Autenticação
  const [autenticado, setAutenticado] = useState<boolean>(true); // Logado por padrão para demonstração
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');

  // Estado dos Dados
  const [eventos, setEventos] = useState<Evento[]>(SEED_EVENTOS);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(SEED_INSCRICOES);

  // Modal de Baixa Manual
  const [inscricaoParaBaixa, setInscricaoParaBaixa] = useState<Inscricao | null>(null);
  const [modalBaixaAberto, setModalBaixaAberto] = useState(false);

  // Efeito GSAP suave em cada troca de aba
  useEffect(() => {
    if (tabContentRef.current) {
      gsap.fromTo(
        tabContentRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }

    if (abaAtiva === 'dashboard') {
      if (heroRef.current) animateHeroEntrance(heroRef.current);
      if (cardsRef.current) animateCardsEntrance(Array.from(cardsRef.current.children));
    }
  }, [abaAtiva]);

  // Métricas Consolidadas
  const metricas = useMemo(() => {
    const total = inscricoes.length;
    const confirmados = inscricoes.filter((i) => i.status !== 'pendente').length;
    const pendentes = inscricoes.filter((i) => i.status === 'pendente').length;
    const receita = inscricoes
      .filter((i) => i.status === 'pago')
      .reduce((acc, i) => acc + (i.evento?.valor || 0), 0);

    return { total, confirmados, pendentes, receita };
  }, [inscricoes]);

  // Filtragem de Inscrições
  const inscricoesFiltradas = useMemo(() => {
    return inscricoes.filter((i) => {
      const matchBusca =
        !filtros.busca ||
        i.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        (i.email && i.email.toLowerCase().includes(filtros.busca.toLowerCase())) ||
        (i.telefone && i.telefone.includes(filtros.busca));

      const matchEvento = !filtros.evento_id || i.evento_id === filtros.evento_id;
      const matchStatus = filtros.status === 'todos' || i.status === filtros.status;
      const matchMetodo = filtros.metodo_pag === 'todos' || i.metodo_pag === filtros.metodo_pag;

      return matchBusca && matchEvento && matchStatus && matchMetodo;
    });
  }, [inscricoes, filtros]);

  // Ações
  const handleConfirmarBaixa = async (
    inscricaoId: string,
    metodo: MetodoPagamento,
    novoStatus: 'pago' | 'isento'
  ) => {
    setInscricoes((prev) =>
      prev.map((i) =>
        i.id === inscricaoId
          ? { ...i, status: novoStatus, metodo_pag: metodo }
          : i
      )
    );
    sucesso('Pagamento confirmado com sucesso!');
  };

  const handleReverterStatus = (inscricaoId: string) => {
    setInscricoes((prev) =>
      prev.map((i) =>
        i.id === inscricaoId ? { ...i, status: 'pendente', metodo_pag: null } : i
      )
    );
    info('Inscrição revertida para pendente.');
  };

  const handleSalvarEvento = async (novoEvento: Partial<Evento>) => {
    if (novoEvento.id) {
      // Edição
      setEventos((prev) =>
        prev.map((ev) => (ev.id === novoEvento.id ? ({ ...ev, ...novoEvento } as Evento) : ev))
      );
    } else {
      // Novo
      const eventoCriado: Evento = {
        ...novoEvento,
        id: Math.random().toString(36).substring(2, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_inscritos: 0,
        inscritos_confirmados: 0,
        vagas_restantes: novoEvento.vagas || 100,
        receita_confirmada: 0,
      } as Evento;

      setEventos((prev) => [eventoCriado, ...prev]);
    }

    setEventoParaEditar(null);
    setAbaAtiva('eventos');
  };

  const copiarLinkEvento = (slug: string) => {
    const url = `${window.location.origin}/evento/${slug}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      sucesso('Link do evento copiado para a área de transferência!');
    }
  };

  // Se não estiver autenticado, exibe tela de login limpa
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal space-y-6 text-left">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-[var(--radius-btn,0.5rem)] bg-black text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-2xl mx-auto border border-black shadow-sm">
              {igrejaConfig.nome.charAt(0)}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              {igrejaConfig.nome} // Painel
            </h1>
            <p className="text-xs text-[#71717A]">
              Acesso para pastores, líderes e equipe de conexão da igreja.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAutenticado(true);
            }}
            className="space-y-4"
          >
            <Input
              label="E-mail de Acesso"
              type="email"
              required
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)}
              placeholder="lideranca@eirachurch.com.br"
            />

            <Input
              label="Senha"
              type="password"
              required
              value={senhaLogin}
              onChange={(e) => setSenhaLogin(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="primary" fullWidth>
              Fazer login no Painel
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-[#71717A] hover:text-black">
              ← Voltar para a página pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verifica se o usuário atual tem permissão para visualizar finanças (Pastores e Admins apenas)
  const podeAcessarFinancas = usuarioRole === 'pastor' || usuarioRole === 'admin';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col transition-colors">
      <AdminHeader onLogout={() => setAutenticado(false)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        <div ref={tabContentRef}>
          {/* ==================================================== */}
          {/* ABA: PAINEL GERAL (DASHBOARD) */}
          {/* ==================================================== */}
          {abaAtiva === 'dashboard' && (
            <div className="space-y-8">
              {/* Banner Institucional da Igreja */}
              <div
                ref={heroRef}
                className="relative w-full rounded-[var(--radius-box,0.75rem)] bg-[#0A0A0A] text-white p-6 sm:p-8 overflow-hidden shadow-sm border border-black"
              >
                <div className="relative z-10 max-w-3xl space-y-2 text-left">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                    <span>VISÃO INTEGRADA DA IGREJA</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Painel de Liderança // {igrejaConfig.nome}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {igrejaConfig.slogan}. Acompanhe inscrições em eventos, vagas em tempo real, visitantes acolhidos pela Conexão e rede de células.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[var(--accent,#FACC15)]/10 to-transparent pointer-events-none" />
              </div>

              {/* Cards de Métricas Consolidadas */}
              <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  titulo="Total de Inscritos"
                  valor={metricas.total}
                  subtexto="Todas as redes ativas"
                  icone={Users}
                />
                <MetricCard
                  titulo="Confirmados"
                  valor={metricas.confirmados}
                  subtexto={`${
                    metricas.total > 0
                      ? Math.round((metricas.confirmados / metricas.total) * 100)
                      : 0
                  }% de conversão`}
                  icone={CheckCircle2}
                />
                <MetricCard
                  titulo="Pagamentos Pendentes"
                  valor={metricas.pendentes}
                  subtexto="Aguardando Pix ou balcão"
                  icone={Clock}
                />

                {/* Exibição condicional da Receita: apenas Pastores e Admins têm acesso financeiro */}
                {podeAcessarFinancas ? (
                  <MetricCard
                    titulo="Receita Confirmada"
                    valor={formatarMoeda(metricas.receita)}
                    subtexto="Pix, cartão e balcão"
                    icone={DollarSign}
                    destaque
                  />
                ) : (
                  <MetricCard
                    titulo="Rede de Células"
                    valor={celulas.length}
                    subtexto="Grupos em multiplicação"
                    icone={Home}
                    destaque
                  />
                )}
              </div>

              {/* Métricas dos Módulos Conexão e Células */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setAbaAtiva('conexao')}
                  className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] flex items-center justify-between shadow-sm cursor-pointer hover:border-black transition-colors"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-xs font-bold text-[#71717A] uppercase">
                      Visitantes // Conexão
                    </span>
                    <p className="text-2xl font-black text-[#0A0A0A]">
                      {visitantes.length} pessoas acolhidas
                    </p>
                    <p className="text-xs text-[#52525B] flex items-center">
                      <span>Acessar acolhimento e contatos</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#E0F2FE] text-[#075985]">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                </div>

                <div
                  onClick={() => setAbaAtiva('celulas')}
                  className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] flex items-center justify-between shadow-sm cursor-pointer hover:border-black transition-colors"
                >
                  <div className="space-y-1 text-left">
                    <span className="text-xs font-bold text-[#71717A] uppercase">
                      Rede de Células
                    </span>
                    <p className="text-2xl font-black text-[#0A0A0A]">
                      {celulas.length} células ativas
                    </p>
                    <p className="text-xs text-[#52525B] flex items-center">
                      <span>Gerenciar integrantes e mapas</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#DCFCE7] text-[#166534]">
                    <Home className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Lista Resumida de Eventos em Destaque */}
              <div className="space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A0A0A]">
                      Eventos em Destaque & Links Rápidos
                    </h3>
                    <p className="text-xs text-[#71717A]">
                      Copie o link direto ou acompanhe a ocupação de vagas:
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="dark"
                    onClick={() => setAbaAtiva('novo-evento')}
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Criar Evento
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {eventos.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] space-y-3 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-[var(--accent,#FACC15)]">
                            {ev.rede}
                          </span>
                          <span className="text-xs font-bold text-[#0A0A0A] tabular-nums">
                            {formatarMoeda(ev.valor)}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-[#0A0A0A] line-clamp-1">
                          {ev.nome}
                        </h4>
                        <p className="text-xs text-[#71717A]">
                          {formatarDataCurta(ev.data_inicio)} • {ev.vagas} vagas
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between">
                        <button
                          onClick={() => copiarLinkEvento(ev.slug)}
                          className="text-xs font-bold text-black flex items-center hover:text-[var(--accent-hover,#CA8A04)] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copiar Link
                        </button>
                        <Link
                          href={`/evento/${ev.slug}`}
                          target="_blank"
                          className="text-xs text-[#71717A] hover:text-black flex items-center"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ABA: CONEXÃO (PESSOAS NOVAS // VISITANTES) */}
          {/* ==================================================== */}
          {abaAtiva === 'conexao' && <ConexaoView />}

          {/* ==================================================== */}
          {/* ABA: REDE DE CÉLULAS */}
          {/* ==================================================== */}
          {abaAtiva === 'celulas' && <CelulasView />}

          {/* ==================================================== */}
          {/* ABA: INSCRIÇÕES (& FINANÇAS PARA PASTORES/ADMINS) */}
          {/* ==================================================== */}
          {abaAtiva === 'inscricoes' && (
            <div className="space-y-4">
              <FilterBar
                eventos={eventos}
                onExportarCsv={() => exportarCsvInscricoes(inscricoesFiltradas)}
                onRefresh={() => info('Dados atualizados.')}
              />

              <DataTable
                inscricoes={inscricoesFiltradas}
                podeConfirmarBaixa={podeAcessarFinancas}
                onAbrirBaixaManual={(i) => {
                  if (!podeAcessarFinancas) {
                    info('Apenas pastores e administradores podem confirmar pagamentos.');
                    return;
                  }
                  setInscricaoParaBaixa(i);
                  setModalBaixaAberto(true);
                }}
                onReverterStatus={podeAcessarFinancas ? handleReverterStatus : undefined}
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* ABA: GERENCIAR EVENTOS */}
          {/* ==================================================== */}
          {abaAtiva === 'eventos' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0A0A0A]">
                    Todos os Eventos Cadastrados
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Gerencie banners, datas, valores e formulários:
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setEventoParaEditar(null);
                    setAbaAtiva('novo-evento');
                  }}
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Cadastrar Novo Evento
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] overflow-hidden flex flex-col justify-between shadow-sm"
                  >
                    <div className="aspect-video bg-black relative">
                      {ev.imagem_url ? (
                        <img
                          src={ev.imagem_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--accent,#FACC15)] font-black text-sm">
                          {igrejaConfig.nome.toUpperCase()}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black bg-black text-[var(--accent,#FACC15)]">
                        {ev.rede}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-base text-[#0A0A0A] line-clamp-1">
                          {ev.nome}
                        </h4>
                        <p className="text-xs text-[#71717A]">
                          {formatarDataCurta(ev.data_inicio)} • {formatarMoeda(ev.valor)}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs">
                        <button
                          onClick={() => copiarLinkEvento(ev.slug)}
                          className="font-bold text-black flex items-center hover:underline cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copiar Link
                        </button>
                        <button
                          onClick={() => {
                            setEventoParaEditar(ev);
                            setAbaAtiva('novo-evento');
                          }}
                          className="text-xs font-semibold text-[#71717A] hover:text-black cursor-pointer"
                        >
                          Editar Evento
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ABA: NOVO EVENTO / EDITAR */}
          {/* ==================================================== */}
          {abaAtiva === 'novo-evento' && (
            <EventoForm
              eventoInicial={eventoParaEditar}
              onSalvar={handleSalvarEvento}
              onCancelar={() => {
                setEventoParaEditar(null);
                setAbaAtiva('eventos');
              }}
            />
          )}

          {/* ==================================================== */}
          {/* ABA: CONFIGURAÇÃO DA IGREJA (PASTORES / ADMIN) */}
          {/* ==================================================== */}
          {abaAtiva === 'configuracao' && <ConfiguracaoIgrejaView />}
        </div>
      </main>

      {/* MODAL DE BAIXA MANUAL */}
      <BaixaManualModal
        inscricao={inscricaoParaBaixa}
        isOpen={modalBaixaAberto}
        onClose={() => {
          setModalBaixaAberto(false);
          setInscricaoParaBaixa(null);
        }}
        onConfirmar={handleConfirmarBaixa}
      />
    </div>
  );
}
