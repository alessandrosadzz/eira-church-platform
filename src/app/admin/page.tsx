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
import { SEED_EVENTOS, SEED_INSCRICOES, supabase } from '../../lib/supabase';
import { formatarMoeda, formatarDataCurta } from '../../lib/formatters';
import { exportarCsvInscricoes } from '../../lib/exportCsv';
import { executarLimpezaComprovantesAntigos } from '../../lib/retencaoComprovantes';
import {
  buscarEventosSupabase,
  salvarEventoSupabase,
  buscarInscricoesSupabase,
  atualizarStatusInscricaoSupabase,
  buscarCelulasSupabase,
  buscarVisitantesSupabase,
} from '../../lib/eventoAdapter';
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
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  LogIn,
  Sparkles,
  TrendingUp,
  Droplets,
  HelpCircle,
  Send,
  Info,
  CalendarCheck,
} from 'lucide-react';

export default function AdminPage() {
  const { sucesso, erro, info } = useToast();
  const {
    abaAtiva,
    setAbaAtiva,
    filtros,
    eventoParaEditar,
    setEventoParaEditar,
    igrejaConfig,
    visitantes,
    celulas,
    setCelulas,
    setVisitantes,
    usuarioRole,
    setUsuarioRole,
    validarLogin,
  } = useAdminStore();

  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Estado de Autenticação Real
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuarioLogin, setUsuarioLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [usuarioNomeLogado, setUsuarioNomeLogado] = useState('');

  // Verifica se há sessão ativa salva no navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessaoSalva = localStorage.getItem('eira_auth_session');
        if (sessaoSalva) {
          const dados = JSON.parse(sessaoSalva);
          if (dados && dados.usuario && dados.role) {
            setAutenticado(true);
            setUsuarioRole(dados.role);
            setUsuarioNomeLogado(dados.nome || dados.usuario);
          }
        }
      } catch {}
    }
  }, [setUsuarioRole]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioLogin.trim() || !senhaLogin.trim()) {
      erro('Informe seu usuário e senha de acesso.');
      return;
    }

    const resultado = validarLogin(usuarioLogin, senhaLogin);
    if (resultado.valido && resultado.role) {
      setAutenticado(true);
      setUsuarioRole(resultado.role);
      setUsuarioNomeLogado(resultado.nome || usuarioLogin);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'eira_auth_session',
            JSON.stringify({
              usuario: usuarioLogin.trim(),
              role: resultado.role,
              nome: resultado.nome,
              logadoEm: new Date().toISOString(),
            })
          );
        } catch {}
      }

      sucesso(`Acesso confirmado: ${resultado.nome}!`);
    } else {
      erro('Credenciais inválidas. Verifique seu usuário e senha.');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setAutenticado(false);
    setUsuarioLogin('');
    setSenhaLogin('');
    setUsuarioNomeLogado('');
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('eira_auth_session');
      } catch {}
    }
    info('Você encerrou a sessão no painel.');
  };

  // Estado dos Dados com Persistência
  const [eventos, setEventos] = useState<Evento[]>(SEED_EVENTOS);
  const [inscricoes, setInscricoes] = useState<Inscricao[]>(SEED_INSCRICOES);

  // Filtro Temporal de Pessoas e Frequência (Pastores e Admins)
  const [filtroPeriodo, setFiltroPeriodo] = useState<
    'hoje' | 'mes_atual' | 'mes_passado' | 'ano' | 'todos'
  >('mes_atual');

  // Modal Central de Atualizações e Novidades da Plataforma
  const [modalAtualizacoesAberto, setModalAtualizacoesAberto] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);

  // Carrega Eventos, Inscrições, Células e Visitantes sincronizados com o Supabase
  const carregarDadosGerais = async (mostrarFeedback = false) => {
    setCarregandoDados(true);
    try {
      const [evs, inscs, cels, viss] = await Promise.all([
        buscarEventosSupabase(),
        buscarInscricoesSupabase(),
        buscarCelulasSupabase(),
        buscarVisitantesSupabase(),
      ]);
      if (evs && evs.length > 0) setEventos(evs);
      if (inscs) setInscricoes(inscs);
      if (cels && cels.length > 0) setCelulas(cels);
      if (viss && viss.length > 0) setVisitantes(viss);

      if (mostrarFeedback) {
        sucesso(
          `Sincronizado com o Supabase! (${inscs?.length || 0} inscrições, ${cels?.length || 0} células, ${viss?.length || 0} conexões)`
        );
      }
    } catch (e) {
      console.warn('Erro ao carregar dados:', e);
      if (mostrarFeedback) {
        erro('Não foi possível sincronizar com o Supabase.');
      }
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    carregarDadosGerais();
  }, []);

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

  // Métricas Consolidadas de Inscrições
  const metricas = useMemo(() => {
    const total = inscricoes.length;
    const confirmados = inscricoes.filter((i) => i.status !== 'pendente').length;
    const pendentes = inscricoes.filter((i) => i.status === 'pendente').length;
    const receita = inscricoes
      .filter((i) => i.status === 'pago')
      .reduce((acc, i) => acc + (i.evento?.valor || 0), 0);

    return { total, confirmados, pendentes, receita };
  }, [inscricoes]);

  // Métricas Consolidadas de Células
  const totalMembrosCelulas = useMemo(() => {
    return celulas.reduce((acc, c) => acc + (c.membros?.length || 0), 0);
  }, [celulas]);

  const totalBatizadosCelulas = useMemo(() => {
    return celulas.reduce(
      (acc, c) => acc + (c.membros?.filter((m) => m.batizado)?.length || 0),
      0
    );
  }, [celulas]);

  const percentualBatizados =
    totalMembrosCelulas > 0
      ? Math.round((totalBatizadosCelulas / totalMembrosCelulas) * 100)
      : 0;

  // Visitantes Filtrados pelo Período Selecionado
  const visitantesNoPeriodo = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();

    return visitantes.filter((v) => {
      if (filtroPeriodo === 'todos') return true;
      const dataStr = v.data_visita || hoje;
      const dataV = new Date(dataStr);

      if (filtroPeriodo === 'hoje') {
        return dataStr === hoje;
      }
      if (filtroPeriodo === 'mes_atual') {
        return (
          dataV.getFullYear() === anoAtual && dataV.getMonth() === mesAtual
        );
      }
      if (filtroPeriodo === 'mes_passado') {
        const mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoDoMesPassado = mesAtual === 0 ? anoAtual - 1 : anoAtual;
        return (
          dataV.getFullYear() === anoDoMesPassado &&
          dataV.getMonth() === mesPassado
        );
      }
      if (filtroPeriodo === 'ano') {
        return dataV.getFullYear() === anoAtual;
      }
      return true;
    });
  }, [visitantes, filtroPeriodo]);

  // Total de Pessoas com a gente na Igreja (Membros de células + visitantes da Conexão)
  const totalPessoasNaIgreja = useMemo(() => {
    return totalMembrosCelulas + visitantes.length;
  }, [totalMembrosCelulas, visitantes]);

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
    await atualizarStatusInscricaoSupabase(inscricaoId, novoStatus, metodo);
    setInscricoes((prev) =>
      prev.map((i) =>
        i.id === inscricaoId
          ? { ...i, status: novoStatus, metodo_pag: metodo }
          : i
      )
    );
    sucesso('Pagamento confirmado com sucesso!');
  };

  const handleReverterStatus = async (inscricaoId: string) => {
    await atualizarStatusInscricaoSupabase(inscricaoId, 'pendente');
    setInscricoes((prev) =>
      prev.map((i) =>
        i.id === inscricaoId ? { ...i, status: 'pendente', metodo_pag: null } : i
      )
    );
    info('Inscrição revertida para pendente.');
  };

  const handleSalvarEvento = async (novoEvento: Partial<Evento>) => {
    const eventoSalvo = await salvarEventoSupabase(novoEvento);

    setEventos((prev) => {
      const idx = prev.findIndex((e) => e.id === eventoSalvo.id || e.slug === eventoSalvo.slug);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = eventoSalvo;
        return copy;
      }
      return [eventoSalvo, ...prev];
    });

    setEventoParaEditar(null);
    setAbaAtiva('eventos');
    sucesso(`Evento "${eventoSalvo.nome}" salvo no banco de dados oficial e visível para todos os pastores e líderes!`);
  };

  // Limpeza automática de comprovantes com mais de 60 dias ao inicializar
  useEffect(() => {
    executarLimpezaComprovantesAntigos(60).catch(() => {});
  }, []);

  const handleLimparComprovantes = async () => {
    const res = await executarLimpezaComprovantesAntigos(60);
    if (res.totalRemovidos > 0) {
      sucesso(res.mensagem);
      try {
        const salvos = localStorage.getItem('eira_inscricoes');
        if (salvos) setInscricoes(JSON.parse(salvos));
      } catch {}
    } else {
      info(res.mensagem);
    }
  };

  const copiarLinkEvento = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eira-church-app.vercel.app';
    const url = `${origin}/evento/${slug}`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      sucesso('Link do evento copiado para a área de transferência!');
    }
  };

  // Se não estiver autenticado, exibe tela de login oficial
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#141418] p-8 rounded-[var(--radius-box,0.75rem)] border border-[#2E2E35] shadow-2xl space-y-6 text-left">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-[var(--radius-btn,0.5rem)] bg-black text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-2xl mx-auto border border-[#2E2E35] shadow-md overflow-hidden">
              {igrejaConfig?.logoUrl ? (
                <img
                  src={igrejaConfig.logoUrl}
                  alt={igrejaConfig.nome}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                igrejaConfig.nome.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#FAFAFA]">
                {igrejaConfig.nome}
              </h1>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Acesso à Liderança, Pastores e Administração
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-tight text-[#E4E4E7] mb-1.5">
                Usuário ou E-mail
              </label>
              <input
                type="text"
                required
                value={usuarioLogin}
                onChange={(e) => setUsuarioLogin(e.target.value)}
                placeholder="pastores, admin ou seu usuário"
                className="w-full h-12 px-3.5 rounded-lg bg-[#1D1D23] border border-[#2E2E35] text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[var(--accent,#FACC15)] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-tight text-[#E4E4E7] mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  required
                  value={senhaLogin}
                  onChange={(e) => setSenhaLogin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-3.5 pr-10 rounded-lg bg-[#1D1D23] border border-[#2E2E35] text-sm text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[var(--accent,#FACC15)] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] transition-colors p-1"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              <span>Entrar no Painel</span>
            </Button>
          </form>

          {/* Orientações Oficiais de Acesso */}
          <div className="p-3.5 rounded-lg bg-[#1D1D23] border border-[#2E2E35] text-[11px] text-[#A1A1AA] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[#FAFAFA] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent,#FACC15)]" />
              <span>Instruções de Acesso:</span>
            </div>
            <p>
              • <strong>Pastores:</strong> usuário <code className="bg-[#141418] px-1 py-0.5 rounded text-[var(--accent,#FACC15)] font-bold">pastores</code>
            </p>
            <p>
              • <strong>Administração:</strong> usuário <code className="bg-[#141418] px-1 py-0.5 rounded text-[var(--accent,#FACC15)] font-bold">admin</code>
            </p>
            <p className="pt-1 text-[#E4E4E7]">
              • <strong>Líder de Célula:</strong> Já cadastrou sua célula? Use seu usuário. Ainda não?{' '}
              <Link href="/cadastro-lider" className="text-[var(--accent,#FACC15)] font-bold underline">
                Cadastrar Célula e Login →
              </Link>
            </p>
          </div>

          <div className="text-center pt-1">
            <Link
              href="/"
              className="text-xs font-semibold text-[#71717A] hover:text-[#FAFAFA] transition-colors"
            >
              ← Voltar para o Portal da Igreja
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
      <AdminHeader
        onLogout={handleLogout}
        onAtualizar={() => carregarDadosGerais(true)}
        carregando={carregandoDados}
      />

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
                <div className="relative z-10 max-w-3xl space-y-3 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                      <span>VISÃO INTEGRADA DA IGREJA</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalAtualizacoesAberto(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#27272A] text-[var(--accent,#FACC15)] hover:bg-[#3F3F46] border border-[#3F3F46] transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>O Que Há de Novo & Atualizações ↗</span>
                    </button>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Painel {usuarioRole === 'lider' ? 'da Liderança de Célula' : 'Pastoral & Administrativo'} // {igrejaConfig.nome}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {igrejaConfig.slogan}. Acompanhe almas acolhidas, rede de células, frequência e a expansão do Reino de Deus.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[var(--accent,#FACC15)]/10 to-transparent pointer-events-none" />
              </div>

              {/* Central de Acesso Rápido para o Culto e Recepção */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#E4E4E7] shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-extrabold text-[#0A0A0A]">Ficha de Boas-Vindas</p>
                    <p className="text-[11px] text-[#71717A]">Para a equipe de recepção no culto</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href="/boas-vindas"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#0A0A0A] transition-colors"
                    >
                      Abrir ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        navigator.clipboard.writeText(`${origin}/boas-vindas`);
                        sucesso('Link da Ficha de Boas-Vindas copiado!');
                      }}
                      className="p-1.5 rounded-lg text-xs font-bold bg-[#0A0A0A] text-[var(--accent,#FACC15)] hover:bg-[#27272A] transition-colors"
                      title="Copiar link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E4E4E7] shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-extrabold text-[#0A0A0A]">Cadastro de Líder</p>
                    <p className="text-[11px] text-[#71717A]">Link para novos líderes de célula</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href="/cadastro-lider"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#0A0A0A] transition-colors"
                    >
                      Abrir ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        navigator.clipboard.writeText(`${origin}/cadastro-lider`);
                        sucesso('Link de Cadastro de Líder copiado!');
                      }}
                      className="p-1.5 rounded-lg text-xs font-bold bg-[#0A0A0A] text-[var(--accent,#FACC15)] hover:bg-[#27272A] transition-colors"
                      title="Copiar link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E4E4E7] shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5 text-left">
                    <p className="text-xs font-extrabold text-[#0A0A0A]">Status da Nuvem</p>
                    <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Supabase & Vercel Ativos
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#F4F4F5] text-[#52525B]">
                    v2.4 Online
                  </span>
                </div>
              </div>

              {/* SE LÍDER DE CÉLULA: Dashboard Focado em Células & Vida Comunitária (Sem Inscrições / Sem Pagamentos) */}
              {usuarioRole === 'lider' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <h3 className="text-base font-extrabold text-[#0A0A0A]">
                        Métricas da Liderança de Célula
                      </h3>
                      <p className="text-xs text-[#71717A]">
                        Acompanhe os discípulos da sua célula, batismos e pessoas do seu bairro.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      titulo="Células na Rede"
                      valor={celulas.length}
                      subtexto="Grupos em multiplicação"
                      icone={Home}
                    />
                    <MetricCard
                      titulo="Total de Integrantes"
                      valor={totalMembrosCelulas}
                      subtexto="Discípulos acompanhados"
                      icone={Users}
                      destaque
                    />
                    <MetricCard
                      titulo="Batizados nas Águas"
                      valor={`${totalBatizadosCelulas} (${percentualBatizados}%)`}
                      subtexto="Almas firmadas na fé"
                      icone={Droplets}
                    />
                    <MetricCard
                      titulo="Novos na Conexão"
                      valor={visitantes.length}
                      subtexto="Aguardando integração"
                      icone={HeartHandshake}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setAbaAtiva('celulas')}
                      className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm cursor-pointer hover:border-black transition-colors flex items-center justify-between text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#71717A] uppercase">
                          Gerenciamento da Célula
                        </span>
                        <p className="text-lg font-black text-[#0A0A0A]">
                          Ver Integrantes & Telefones
                        </p>
                        <p className="text-xs text-[#52525B] flex items-center">
                          <span>Editar membros, cargos e batismo</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#DCFCE7] text-[#166534]">
                        <Home className="w-6 h-6" />
                      </div>
                    </div>

                    <div
                      onClick={() => setAbaAtiva('conexao')}
                      className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm cursor-pointer hover:border-black transition-colors flex items-center justify-between text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#71717A] uppercase">
                          Pessoas do Meu Bairro
                        </span>
                        <p className="text-lg font-black text-[#0A0A0A]">
                          Acolhimento da Conexão
                        </p>
                        <p className="text-xs text-[#52525B] flex items-center">
                          <span>Convidar visitantes para sua célula</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#E0F2FE] text-[#075985]">
                        <HeartHandshake className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* SE PASTOR OU ADMINISTRADOR: Dashboard Completo com Filtro Temporal Mês a Mês e Ano */
                <div className="space-y-8">
                  {/* Seletor Temporal de Frequência & Membresia */}
                  <div className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F4F4F5] pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-[var(--accent-hover,#CA8A04)]" />
                          <h3 className="font-extrabold text-base text-[#0A0A0A]">
                            Raio-X de Frequência, Almas e Membresia
                          </h3>
                        </div>
                        <p className="text-xs text-[#71717A]">
                          Monitore quantas pessoas temos na igreja, células e visitantes acolhidos no período.
                        </p>
                      </div>

                      {/* Filtros Temporais */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'hoje', label: 'Hoje' },
                          { id: 'mes_atual', label: 'Este Mês' },
                          { id: 'mes_passado', label: 'Mês Passado' },
                          { id: 'ano', label: 'Este Ano' },
                          { id: 'todos', label: 'Total Histórico' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setFiltroPeriodo(p.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              filtroPeriodo === p.id
                                ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-xs'
                                : 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7] hover:border-black'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4 Cards de Pessoas & Frequência */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        titulo="Pessoas na Igreja"
                        valor={totalPessoasNaIgreja}
                        subtexto="Membros ativos + Almas acolhidas"
                        icone={Users}
                        destaque
                      />
                      <MetricCard
                        titulo="Pessoas nas Células"
                        valor={totalMembrosCelulas}
                        subtexto={`Em ${celulas.length} células ativas`}
                        icone={Home}
                      />
                      <MetricCard
                        titulo="Visitantes no Período"
                        valor={visitantesNoPeriodo.length}
                        subtexto={`Filtro: ${
                          filtroPeriodo === 'hoje'
                            ? 'Hoje'
                            : filtroPeriodo === 'mes_atual'
                            ? 'Mês atual'
                            : filtroPeriodo === 'mes_passado'
                            ? 'Mês passado'
                            : filtroPeriodo === 'ano'
                            ? 'Ano atual'
                            : 'Todo histórico'
                        }`}
                        icone={HeartHandshake}
                      />
                      <MetricCard
                        titulo="Batismo & Discipulado"
                        valor={`${totalBatizadosCelulas} (${percentualBatizados}%)`}
                        subtexto="Membros batizados nas águas"
                        icone={Droplets}
                      />
                    </div>
                  </div>

                  {/* Bloco de Eventos, Inscrições e Arrecadação */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-extrabold text-base text-[#0A0A0A]">
                      Eventos Oficiais & Arrecadação
                    </h3>

                    <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        titulo="Total de Inscritos"
                        valor={metricas.total}
                        subtexto="Em todos os eventos"
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
                        subtexto="Aguardando confirmação"
                        icone={Clock}
                      />
                      <MetricCard
                        titulo="Receita Confirmada"
                        valor={formatarMoeda(metricas.receita)}
                        subtexto="Pix, cartão e balcão"
                        icone={DollarSign}
                        destaque
                      />
                    </div>
                  </div>
                </div>
              )}

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {eventos.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md hover:border-black/20 transition-all duration-200"
                    >
                      {/* Banner do Evento 16:9 */}
                      <div className="relative w-full aspect-video bg-[#0A0A0A] overflow-hidden">
                        {ev.imagem_url ? (
                          <img
                            src={ev.imagem_url}
                            alt={`Banner de ${ev.nome}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#18181B] text-[var(--accent,#FACC15)] p-4 text-center">
                            <span className="font-black text-sm tracking-tight">EIRA CHURCH</span>
                            <span className="text-[10px] font-bold text-[#A1A1AA] uppercase mt-1">
                              REDE {ev.rede.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {/* Badges Flutuantes sobre o Banner */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-[var(--accent,#FACC15)] shadow-sm">
                            {ev.rede}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-[#0A0A0A] shadow-sm backdrop-blur-xs">
                            {ev.categoria}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                          <span className="px-2.5 py-0.5 rounded text-xs font-black bg-black/90 text-white border border-white/20 shadow-sm tabular-nums backdrop-blur-xs">
                            {formatarMoeda(ev.valor)}
                          </span>
                        </div>
                      </div>

                      {/* Informações e Ações */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-sm text-[#0A0A0A] line-clamp-1 group-hover:text-[var(--accent-hover,#CA8A04)] transition-colors">
                            {ev.nome}
                          </h4>
                          <p className="text-xs text-[#71717A] flex items-center gap-1">
                            <span>📅 {formatarDataCurta(ev.data_inicio)}</span>
                            <span>•</span>
                            <span>👥 {ev.vagas} vagas</span>
                          </p>
                          {ev.local_nome && (
                            <p className="text-[11px] text-[#71717A] truncate">
                              📍 {ev.local_nome}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => copiarLinkEvento(ev.slug)}
                            className="text-xs font-bold text-black flex items-center hover:text-[var(--accent-hover,#CA8A04)] transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copiar Link
                          </button>
                          <Link
                            href={`/evento/${ev.slug}`}
                            target="_blank"
                            className="text-xs font-bold text-[#71717A] hover:text-black flex items-center transition-colors"
                          >
                            <span>Abrir Página</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
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
              {/* Barra de Retenção e Otimização de Comprovantes */}
              {podeAcessarFinancas && (
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex items-center space-x-2.5">
                    <span className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#166534]">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A]">
                        Política de Economia de Espaço & LGPD (60 dias)
                      </p>
                      <p className="text-[11px] text-[#64748B]">
                        Prints de comprovantes com mais de 60 dias são excluídos para poupar espaço em banco de dados, mantendo confirmações intactas.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLimparComprovantes}
                    className="shrink-0 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 text-[#DC2626]" />
                    Limpar Comprovantes Antigos (+60 dias)
                  </Button>
                </div>
              )}

              <FilterBar
                eventos={eventos}
                onExportarCsv={() => exportarCsvInscricoes(inscricoesFiltradas)}
                onRefresh={() => carregarDadosGerais(true)}
                isRefreshing={carregandoDados}
              />

              <DataTable
                inscricoes={inscricoesFiltradas}
                podeConfirmarBaixa={true}
                onAbrirBaixaManual={(i) => {
                  setInscricaoParaBaixa(i);
                  setModalBaixaAberto(true);
                }}
                onReverterStatus={handleReverterStatus}
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
                {eventos.map((ev) => {
                  const inscritosDesteEvento = inscricoes.filter(
                    (i) => i.evento_id === ev.id || i.evento?.nome === ev.nome
                  );
                  const pagasDesteEvento = inscritosDesteEvento.filter((i) => i.status === 'pago').length;
                  const pendentesDesteEvento = inscritosDesteEvento.filter((i) => i.status === 'pendente').length;

                  return (
                    <div
                      key={ev.id}
                      className="bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
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
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-extrabold bg-white text-black shadow-sm">
                          {formatarMoeda(ev.valor)}
                        </span>
                      </div>

                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-[#0A0A0A] line-clamp-1">
                            {ev.nome}
                          </h4>
                          <p className="text-xs text-[#71717A]">
                            📅 {formatarDataCurta(ev.data_inicio)} • 📍 {ev.local_nome || 'Eira Church'}
                          </p>
                          <div className="pt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-[#F4F4F5] text-[#0A0A0A] border border-[#E4E4E7]">
                              👥 {inscritosDesteEvento.length} inscritos ({pagasDesteEvento} pagos • {pendentesDesteEvento} pendentes)
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => copiarLinkEvento(ev.slug)}
                            className="font-bold text-black flex items-center hover:underline cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copiar Link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEventoParaEditar(ev);
                              setAbaAtiva('novo-evento');
                            }}
                            className="text-xs font-bold text-black hover:text-[var(--accent-hover,#CA8A04)] cursor-pointer"
                          >
                            ✏️ Editar Evento
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* MODAL DE ATUALIZAÇÕES DO SISTEMA & GUIA PRÁTICO */}
      {modalAtualizacoesAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal overflow-hidden max-h-[90vh] flex flex-col text-left">
            {/* Topo do Modal */}
            <div className="p-6 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-black text-[var(--accent,#FACC15)]">
                  <Sparkles className="w-3 h-3" />
                  <span>VERSÃO OFICIAL 2.4 — EIRA CHURCH</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0A0A0A]">
                  Central de Atualizações & Guia Prático
                </h3>
                <p className="text-xs text-[#71717A]">
                  Veja o que foi implementado, como usar no dia a dia da igreja e envie sugestões de melhoria.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAtualizacoesAberto(false)}
                className="text-[#71717A] hover:text-black font-bold text-xl px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Bloco 1: O que foi feito até agora */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-[#0A0A0A] flex items-center gap-1.5">
                  <span className="p-1 rounded bg-[#FEF08A] text-[#854D0E]">🚀</span>
                  <span>O que foi feito e adicionado até agora:</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">👨‍👩‍👧 Segmentação por Gênero & Redes</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Cadastro com identificação de <strong>Homem, Mulher ou Casal</strong>, conectado às redes de Homens, Mulheres, Jovens (One Way), Teens (Hype) e Casais.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">🗺️ Google Maps & Proximidade de Bairro</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Geração de rota direta no Google Maps e detecção em tempo real da célula mais próxima quando o visitante digita o bairro.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">✏️ Edição de Integrantes de Célula</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Agora é possível editar telefones, cargos na célula, tempo de caminhada e status de batismo sem precisar recadastrar a pessoa.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">🏛️ Origem por Culto & Encaminhamento</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Saiba de qual culto a pessoa veio (Domingo, One Way ou Hype) e se ela já congrega em uma célula ou deseja ser encaminhada.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">📊 Raio-X com Filtros Mês a Mês</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Filtre no dashboard o crescimento de Hoje, Este Mês, Mês Passado ou Ano para acompanhar a membresia e novos visitantes.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                    <p className="font-bold text-[#0A0A0A]">🖼️ Upload Direto de Favicon e Banners</p>
                    <p className="text-[#52525B] leading-relaxed">
                      Upload local de imagens para Favicon da aba, banner do evento (16:9) e logo sem depender de links externos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Como usar de forma prática */}
              <div className="space-y-3 pt-3 border-t border-[#F4F4F5]">
                <h4 className="font-extrabold text-sm text-[#0A0A0A] flex items-center gap-1.5">
                  <span className="p-1 rounded bg-[#E0F2FE] text-[#075985]">💡</span>
                  <span>Como usar de forma prática no dia a dia ministerial:</span>
                </h4>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                    <strong className="text-[#0A0A0A]">1. No Domingo / Recepção:</strong>
                    <p className="text-[#64748B]">
                      Abra o link <code className="bg-[#E2E8F0] px-1 py-0.5 rounded text-black font-bold">/boas-vindas</code> em tablets ou celulares da equipe de acolhimento. As informações caem instantaneamente no painel pastoral.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                    <strong className="text-[#0A0A0A]">2. Para Líderes de Célula:</strong>
                    <p className="text-[#64748B]">
                      Acesse a aba <strong>Células</strong> para atualizar os membros e use a aba <strong>Conexão</strong> para ver novas pessoas que moram no mesmo bairro da sua reunião.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-0.5">
                    <strong className="text-[#0A0A0A]">3. Para Pastores e Administração:</strong>
                    <p className="text-[#64748B]">
                      Acompanhe as métricas de saúde no Dashboard principal e use o filtro <code className="bg-[#E2E8F0] px-1 py-0.5 rounded text-black font-bold">Este Mês</code> ou <code className="bg-[#E2E8F0] px-1 py-0.5 rounded text-black font-bold">Mês Passado</code> para planejar batismos e cultos de celebração.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Canal de Sugestões e Melhorias */}
              <div className="p-4 rounded-xl bg-[#FEF08A]/30 border border-[#FDE047] space-y-2">
                <div className="flex items-center space-x-2 text-[#854D0E] font-bold text-xs">
                  <Send className="w-4 h-4 text-[#854D0E]" />
                  <span>O que podemos melhorar no sistema?</span>
                </div>
                <p className="text-[#713F12]">
                  Tem alguma ideia de funcionalidade, relatório ou melhoria que ajudaria a Eira Church? Fale diretamente com o desenvolvimento para incluirmos nas próximas releases.
                </p>
                <div className="pt-1">
                  <a
                    href="https://wa.me/5545999999999?text=Ol%C3%A1!%20Gostaria%20de%20sugerir%20uma%20melhoria%20para%20a%20plataforma%20da%20Eira%20Church:"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#0A0A0A] text-[var(--accent,#FACC15)] font-bold text-xs hover:bg-[#27272A] transition-colors"
                  >
                    <span>💬 Enviar Sugestão de Melhoria</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setModalAtualizacoesAberto(false)}
              >
                Entendi, fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
