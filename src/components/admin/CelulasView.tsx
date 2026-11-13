'use client';

// src/components/admin/CelulasView.tsx

import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Celula, CelulaMembro } from '../../types/igreja';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  Home,
  Users,
  MapPin,
  Clock,
  ExternalLink,
  PlusCircle,
  Copy,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  UserPlus,
  Shield,
  Droplets,
  Share2,
  Pencil,
  RefreshCw,
  Crown,
  Send,
  X,
} from 'lucide-react';
import {
  salvarCelulaSupabase,
  atualizarCelulaSupabase,
  removerCelulaSupabase,
  buscarCelulasSupabase,
} from '../../lib/eventoAdapter';

export const CelulasView: React.FC = () => {
  const { sucesso, info } = useToast();
  const {
    celulas,
    setCelulas,
    adicionarCelula,
    removerCelula,
    adicionarMembroCelula,
    editarMembroCelula,
    removerMembroCelula,
    toggleBatismoMembro,
    usuarioRole,
    usuarioNomeLogado,
    igrejaConfig,
  } = useAdminStore();

  const isLiderCelula = usuarioRole === 'lider_celula' || usuarioRole === 'lider';
  const isLider12 = usuarioRole === 'lider_12';
  const isDiretoria = usuarioRole === 'pastor' || usuarioRole === 'admin';
  const podeGerarConvites = isLider12 || isDiretoria;

  const [modalConvitesAberto, setModalConvitesAberto] = useState(false);
  const [carregandoCelulas, setCarregandoCelulas] = useState(false);

  const [busca, setBusca] = useState('');
  const [redeFiltro, setRedeFiltro] = useState<string>('Todas');

  // Modais
  const [modalNovaCelula, setModalNovaCelula] = useState(false);
  const [celulaSelecionada, setCelulaSelecionada] = useState<Celula | null>(null);

  // Modal e Formulário de Edição de Membro
  const [membroParaEditar, setMembroParaEditar] = useState<{
    celulaId: string;
    membro: CelulaMembro;
  } | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editTel, setEditTel] = useState('');
  const [editFuncao, setEditFuncao] = useState<CelulaMembro['funcao']>('Membro');
  const [editTempo, setEditTempo] = useState('Recém-chegado');
  const [editBatizado, setEditBatizado] = useState(false);

  const abrirEdicaoMembro = (celulaId: string, m: CelulaMembro) => {
    setMembroParaEditar({ celulaId, membro: m });
    setEditNome(m.nome);
    setEditTel(m.telefone);
    setEditFuncao(m.funcao);
    setEditTempo(m.tempo_celula);
    setEditBatizado(m.batizado);
  };

  const handleSalvarEdicaoMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membroParaEditar) return;
    if (!editNome.trim()) {
      info('Informe o nome do integrante.');
      return;
    }
    const dadosAtualizados: Partial<CelulaMembro> = {
      nome: editNome.trim(),
      telefone: editTel.trim(),
      funcao: editFuncao,
      tempo_celula: editTempo,
      batizado: editBatizado,
    };
    editarMembroCelula(membroParaEditar.celulaId, membroParaEditar.membro.id, dadosAtualizados);
    const membrosNovos = celulaSelecionada
      ? celulaSelecionada.membros.map((x) =>
          x.id === membroParaEditar.membro.id ? { ...x, ...dadosAtualizados } : x
        )
      : [];
    setCelulaSelecionada((prev) =>
      prev
        ? {
            ...prev,
            membros: membrosNovos,
          }
        : null
    );
    await atualizarCelulaSupabase(membroParaEditar.celulaId, {
      membros: membrosNovos,
    });
    sucesso(`Dados de ${editNome} atualizados e salvos no Supabase!`);
    setMembroParaEditar(null);
  };

  // Form Nova Célula
  const [novaNome, setNovaNome] = useState('');
  const [novaRede, setNovaRede] = useState<Celula['rede']>('Hype');
  const [novoLiderNome, setNovoLiderNome] = useState('');
  const [novoLiderTel, setNovoLiderTel] = useState('');
  const [novoViceLider, setNovoViceLider] = useState('');
  const [novoAnfitriao, setNovoAnfitriao] = useState('');
  const [novoDia, setNovoDia] = useState('Quinta-feira');
  const [novoHorario, setNovoHorario] = useState('20h00');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');

  // Form Novo Membro
  const [membroNome, setMembroNome] = useState('');
  const [membroTel, setMembroTel] = useState('');
  const [membroTempo, setMembroTempo] = useState('Recém-chegado');
  const [membroBatizado, setMembroBatizado] = useState(false);
  const [membroFuncao, setMembroFuncao] = useState<CelulaMembro['funcao']>('Membro');

  // Métricas Consolidadas
  const metricas = useMemo(() => {
    const totalCelulas = celulas.length;
    let totalMembros = 0;
    let totalBatizados = 0;

    celulas.forEach((c) => {
      totalMembros += c.membros.length;
      totalBatizados += c.membros.filter((m) => m.batizado).length;
    });

    const percentualBatizados =
      totalMembros > 0 ? Math.round((totalBatizados / totalMembros) * 100) : 0;
    const mediaPorCelula =
      totalCelulas > 0 ? (totalMembros / totalCelulas).toFixed(1) : 0;

    return { totalCelulas, totalMembros, totalBatizados, percentualBatizados, mediaPorCelula };
  }, [celulas]);

  // Lista Filtrada
  const celulasFiltradas = useMemo(() => {
    let lista = celulas;

    // Se for líder de célula comum, restringe a visão exclusivamente à sua própria célula
    if (isLiderCelula) {
      const nomeNorm = (usuarioNomeLogado || '').toLowerCase().trim();
      const celPropria = celulas.filter((c) => {
        if (c.lider_nome && c.lider_nome.toLowerCase().trim().includes(nomeNorm)) return true;
        if (c.anfitriao_nome && c.anfitriao_nome.startsWith('{')) {
          try {
            const meta = JSON.parse(c.anfitriao_nome);
            if (meta.usuario && meta.usuario.toLowerCase().trim() === nomeNorm) return true;
          } catch {}
        }
        return false;
      });
      lista = celPropria.length > 0 ? celPropria : celulas.slice(0, 1);
    }

    return lista.filter((c) => {
      const matchBusca =
        !busca.trim() ||
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.bairro.toLowerCase().includes(busca.toLowerCase()) ||
        c.lider_nome.toLowerCase().includes(busca.toLowerCase());

      const matchRede = redeFiltro === 'Todas' || c.rede === redeFiltro;

      return matchBusca && matchRede;
    });
  }, [celulas, isLiderCelula, usuarioNomeLogado, busca, redeFiltro]);

  // Copiar link para líderes
  const handleCopiarLinkLideres = () => {
    const url = `${window.location.origin}/cadastro-lider`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      sucesso('Link de cadastro para líderes copiado! Envie no grupo de WhatsApp.');
    }
  };

  // Recarregar células do Supabase
  const handleRecarregarCelulas = async () => {
    setCarregandoCelulas(true);
    try {
      const cels = await buscarCelulasSupabase();
      if (cels && cels.length > 0) {
        setCelulas(cels);
        sucesso(`Células sincronizadas com o Supabase! (${cels.length} células ativas)`);
      } else {
        info('Nenhuma célula encontrada no banco.');
      }
    } catch {
      info('Não foi possível atualizar as células.');
    } finally {
      setCarregandoCelulas(false);
    }
  };

  // Salvar Nova Célula
  const handleSalvarCelula = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!novaNome.trim()) {
      info('Informe o nome da célula.');
      return;
    }
    if (!novoLiderNome.trim()) {
      info('Informe o nome do líder responsável.');
      return;
    }

    const cidadeIgreja =
      igrejaConfig?.endereco?.cidade?.trim() ||
      (igrejaConfig?.cidadePix ? `${igrejaConfig.cidadePix} - SC` : '') ||
      'Joinville - SC';

    const localizacaoTexto = [novoEndereco || novoBairro, cidadeIgreja].filter(Boolean).join(', ');
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(localizacaoTexto)}`;

    const celulaCriada = await salvarCelulaSupabase({
      nome: novaNome.trim(),
      rede: novaRede,
      lider_nome: novoLiderNome.trim(),
      lider_telefone: novoLiderTel.trim() || '(47) 99999-9999',
      vice_lider_nome: novoViceLider.trim() || undefined,
      anfitriao_nome: novoAnfitriao.trim() || undefined,
      dia_semana: novoDia,
      horario: novoHorario,
      bairro: novoBairro.trim() || 'Centro',
      endereco: novoEndereco.trim() || localizacaoTexto,
      maps_url: mapsUrl,
      membros: [
        {
          id: `m-lider-${Date.now()}`,
          nome: novoLiderNome.trim(),
          telefone: novoLiderTel.trim() || '(47) 99999-9999',
          tempo_celula: '1 ano+',
          batizado: true,
          funcao: 'Líder',
        },
      ],
    });

    adicionarCelula(celulaCriada);

    sucesso('Célula cadastrada com sucesso e sincronizada com o Supabase!');
    setModalNovaCelula(false);
    setNovaNome('');
    setNovoLiderNome('');
    setNovoLiderTel('');
    setNovoViceLider('');
    setNovoAnfitriao('');
    setNovoBairro('');
    setNovoEndereco('');
  };

  // Salvar Novo Membro na Célula Selecionada
  const handleAdicionarMembro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celulaSelecionada) return;

    if (!membroNome.trim()) {
      info('Informe o nome do participante da célula.');
      return;
    }

    const novoMembro: CelulaMembro = {
      id: `m-${Date.now()}`,
      nome: membroNome.trim(),
      telefone: membroTel.trim() || '(47) 99999-9999',
      tempo_celula: membroTempo,
      batizado: membroBatizado,
      funcao: membroFuncao,
    };

    adicionarMembroCelula(celulaSelecionada.id, novoMembro);

    const membrosAtualizados = [...celulaSelecionada.membros, novoMembro];

    // Atualiza estado local da célula aberta no modal
    setCelulaSelecionada((prev) =>
      prev
        ? {
            ...prev,
            membros: membrosAtualizados,
          }
        : null
    );

    await atualizarCelulaSupabase(celulaSelecionada.id, {
      membros: membrosAtualizados,
    });

    sucesso(`${membroNome.trim()} adicionado(a) à célula e salvo no Supabase!`);
    setMembroNome('');
    setMembroTel('');
  };

  return (
    <div className="space-y-6 text-left w-full max-w-7xl mx-auto">
      {/* ==================================================== */}
      {/* CABEÇALHO DO MÓDULO CÉLULAS */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
              <Home className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              Rede de Células // Gestão & Liderança
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#71717A]">
            Controle de membros, tempo de caminhada, batismo nas águas e rotas no Google Maps de cada reunião.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="md"
            onClick={handleRecarregarCelulas}
            isLoading={carregandoCelulas}
            title="Atualizar lista de células do Supabase"
            className="flex-1 sm:flex-initial border border-[#E4E4E7]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${carregandoCelulas ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>

          {/* Somente Líderes de 12 e Pastores podem criar convites para novos líderes */}
          {podeGerarConvites && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalConvitesAberto(true)}
              title="Gerar convite para novo líder de célula ou líder de 12"
              className="flex-1 sm:flex-initial"
            >
              <Crown className="w-4 h-4 mr-2 text-amber-600" />
              <span>Convidar Líderes</span>
            </Button>
          )}

          {(!isLiderCelula || celulasFiltradas.length === 0) && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalNovaCelula(true)}
              className="flex-1 sm:flex-initial shadow-md"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>{isLiderCelula ? 'Cadastrar Minha Célula' : 'Cadastrar Célula'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* CARDS DE MÉTRICAS DAS CÉLULAS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Células Ativas
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
            {metricas.totalCelulas}
          </p>
          <span className="text-xs text-[#52525B]">Reuniões semanais</span>
        </div>

        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Pessoas nas Células
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
            {metricas.totalMembros}
          </p>
          <span className="text-xs text-[#52525B]">
            Média de {metricas.mediaPorCelula} por grupo
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Batizados nas Águas
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
            {metricas.totalBatizados}
          </p>
          <span className="text-xs text-[#16A34A] font-bold">
            {metricas.percentualBatizados}% da rede
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Acompanhamento Pastoral
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
            100%
          </p>
          <span className="text-xs text-[#52525B]">Supervisão semanal</span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* FILTROS E BUSCA */}
      {/* ==================================================== */}
      <div className="p-4 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por célula, bairro ou líder..."
            className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-sm text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        {/* Filtro por Rede */}
        <div className="flex items-center overflow-x-auto w-full md:w-auto space-x-1.5 no-scrollbar">
          {['Todas', 'Homens', 'Mulheres', 'Hype', 'One Way', 'Casais', 'Família'].map((r) => (
            <button
              key={r}
              onClick={() => setRedeFiltro(r)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                redeFiltro === r
                  ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-sm'
                  : 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7] hover:border-black'
              }`}
            >
              {r === 'Todas' ? 'Todas as Redes' : `Rede ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* LISTAGEM DE CÉLULAS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {celulasFiltradas.map((celula) => {
          const batizadosContagem = celula.membros.filter((m) => m.batizado).length;
          const taxaBatismo =
            celula.membros.length > 0
              ? Math.round((batizadosContagem / celula.membros.length) * 100)
              : 0;

          return (
            <div
              key={celula.id}
              className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex flex-col justify-between space-y-4 hover:border-black transition-colors"
            >
              <div className="space-y-3">
                {/* Topo do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black text-[var(--accent,#FACC15)]">
                      {celula.rede}
                    </span>
                    <h3 className="font-extrabold text-base text-[#0A0A0A] mt-1.5 line-clamp-1">
                      {celula.nome}
                    </h3>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FAFAFA] border border-[#E4E4E7] text-[#0A0A0A] tabular-nums shrink-0">
                    {celula.membros.length} membros
                  </span>
                </div>

                {/* Dados de Liderança e Reunião */}
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#F4F4F5] text-xs space-y-1.5">
                  <p className="text-[#52525B]">
                    <strong className="text-[#0A0A0A]">Líder:</strong> {celula.lider_nome} • {celula.lider_telefone}
                  </p>
                  <p className="text-[#52525B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#71717A]" />
                    <span>{celula.dia_semana} às {celula.horario}</span>
                  </p>
                  <p className="text-[#52525B] flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#71717A] mt-0.5 shrink-0" />
                    <span>{celula.endereco}</span>
                  </p>
                </div>

                {/* Estatística de Batismo */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#71717A] flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Batismo nas Águas:</span>
                  </span>
                  <span className="font-bold text-[#0A0A0A]">
                    {batizadosContagem}/{celula.membros.length} ({taxaBatismo}%)
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between gap-2">
                <a
                  href={celula.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#0A0A0A] bg-[#FAFAFA] border border-[#E4E4E7] hover:border-black transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent,#EAB308)]" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#71717A]" />
                </a>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCelulaSelecionada(celula)}
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  <span>Ver Membros</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* MODAL: GERENCIAR MEMBROS DA CÉLULA */}
      {/* ==================================================== */}
      {celulaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-[var(--accent,#FACC15)]">
                  {celulaSelecionada.rede}
                </span>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  {celulaSelecionada.nome}
                </h3>
                <p className="text-xs text-[#71717A]">
                  Líder: {celulaSelecionada.lider_nome} • {celulaSelecionada.bairro}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCelulaSelecionada(null)}
                className="text-[#71717A] hover:text-black font-bold text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Modal: Lista de Membros */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
                  Integrantes da Célula ({celulaSelecionada.membros.length})
                </h4>
                <a
                  href={celulaSelecionada.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--accent-hover,#CA8A04)] font-bold flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Abrir local no Maps</span>
                </a>
              </div>

              <div className="space-y-2">
                {celulaSelecionada.membros.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#0A0A0A]">{m.nome}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4E4E7] text-[#0A0A0A]">
                          {m.funcao}
                        </span>
                      </div>
                      <p className="text-[#52525B]">
                        {m.telefone} • {m.tempo_celula} na célula
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          toggleBatismoMembro(celulaSelecionada.id, m.id);
                          setCelulaSelecionada((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  membros: prev.membros.map((x) =>
                                    x.id === m.id ? { ...x, batizado: !x.batizado } : x
                                  ),
                                }
                              : null
                          );
                          sucesso(
                            `Status de batismo de ${m.nome} atualizado para: ${
                              !m.batizado ? 'Batizado(a)' : 'Não batizado(a)'
                            }`
                          );
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
                          m.batizado
                            ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                            : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        }`}
                        title="Clique para alternar o status de batismo"
                      >
                        {m.batizado ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Batizado</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Não batizado</span>
                          </>
                        )}
                      </button>

                      {/* Botão de Edição dos Dados do Membro */}
                      <button
                        type="button"
                        onClick={() => abrirEdicaoMembro(celulaSelecionada.id, m)}
                        className="p-1.5 text-[#52525B] hover:text-black hover:bg-[#E4E4E7] rounded-md transition-colors"
                        title="Editar dados e telefone do integrante"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {m.funcao !== 'Líder' && (
                        <button
                          type="button"
                          onClick={() => {
                            removerMembroCelula(celulaSelecionada.id, m.id);
                            setCelulaSelecionada((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    membros: prev.membros.filter((x) => x.id !== m.id),
                                  }
                                : null
                            );
                            info(`${m.nome} removido(a) da célula.`);
                          }}
                          className="p-1.5 text-[#A1A1AA] hover:text-[#EF4444] rounded transition-colors"
                          title="Remover da célula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário para Adicionar Novo Membro */}
              <form
                onSubmit={handleAdicionarMembro}
                className="p-4 rounded-xl bg-white border border-[#E4E4E7] space-y-3 mt-4 text-left"
              >
                <div className="flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4 text-[#0A0A0A]" />
                  <h5 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
                    Adicionar Pessoa à Célula
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nome da Pessoa"
                    required
                    value={membroNome}
                    onChange={(e) => setMembroNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                  />

                  <Input
                    label="WhatsApp com DDD"
                    value={membroTel}
                    onChange={(e) => setMembroTel(e.target.value)}
                    placeholder="(45) 99888-7766"
                  />

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#0A0A0A] mb-1">
                      Tempo na Célula
                    </label>
                    <select
                      value={membroTempo}
                      onChange={(e) => setMembroTempo(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-[#0A0A0A]"
                    >
                      <option value="Recém-chegado">Recém-chegado (menos de 1 mês)</option>
                      <option value="3 meses">3 meses</option>
                      <option value="6 meses">6 meses</option>
                      <option value="1 ano+">1 ano ou mais</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-[#0A0A0A] mb-1">
                      Função na Célula
                    </label>
                    <select
                      value={membroFuncao}
                      onChange={(e) => setMembroFuncao(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-[#0A0A0A]"
                    >
                      <option value="Membro">Membro</option>
                      <option value="Líder em Treinamento">Líder em Treinamento</option>
                      <option value="Anfitrião">Anfitrião</option>
                      <option value="Vice-líder">Vice-líder</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs font-bold text-[#0A0A0A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={membroBatizado}
                      onChange={(e) => setMembroBatizado(e.target.checked)}
                      className="w-4 h-4 rounded text-black focus:ring-black cursor-pointer"
                    />
                    <span>Já é batizado(a) nas águas</span>
                  </label>

                  <Button type="submit" variant="primary" size="sm">
                    Salvar Integrante
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: CADASTRAR NOVA CÉLULA */}
      {/* ==================================================== */}
      {modalNovaCelula && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                  <Home className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Cadastrar Nova Célula
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNovaCelula(false)}
                className="text-[#71717A] hover:text-black font-bold text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSalvarCelula}
              className="p-5 overflow-y-auto space-y-4 text-left flex-1"
            >
              <Input
                label="Nome da Célula"
                required
                value={novaNome}
                onChange={(e) => setNovaNome(e.target.value)}
                placeholder="Ex: Célula Hype // Alpha"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                    Rede Ministerial
                  </label>
                  <select
                    value={novaRede}
                    onChange={(e) => setNovaRede(e.target.value as any)}
                    className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
                  >
                    <option value="Homens">Rede de Homens</option>
                    <option value="Mulheres">Rede de Mulheres</option>
                    <option value="Hype">Rede Hype (Teens / Adolescentes)</option>
                    <option value="One Way">Rede One Way (Jovens / Universitários)</option>
                    <option value="Casais">Rede de Casais</option>
                    <option value="Família">Rede da Família</option>
                    <option value="Adultos">Rede de Adultos</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <Input
                  label="Bairro da Reunião"
                  required
                  value={novoBairro}
                  onChange={(e) => setNovoBairro(e.target.value)}
                  placeholder="Ex: América, Glória, Centro..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do Líder Responsável"
                  required
                  value={novoLiderNome}
                  onChange={(e) => setNovoLiderNome(e.target.value)}
                  placeholder="Ex: Gabriel Silva"
                />

                <Input
                  label="WhatsApp do Líder"
                  required
                  value={novoLiderTel}
                  onChange={(e) => setNovoLiderTel(e.target.value)}
                  placeholder="(47) 99881-2233"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Dia da Semana"
                  value={novoDia}
                  onChange={(e) => setNovoDia(e.target.value)}
                  placeholder="Quinta-feira"
                />

                <Input
                  label="Horário"
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                  placeholder="20h00"
                />
              </div>

              <Input
                label="Endereço Completo para rota no Google Maps"
                value={novoEndereco}
                onChange={(e) => setNovoEndereco(e.target.value)}
                placeholder="Ex: Rua Dr. João Colin, 1234 - América"
              />

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalNovaCelula(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Cadastrar Célula
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDITAR INTEGRANTE DA CÉLULA */}
      {/* ==================================================== */}
      {membroParaEditar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal overflow-hidden">
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-black">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0A0A0A]">
                    Editar Integrante
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Atualize os dados e telefone de {membroParaEditar.membro.nome}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMembroParaEditar(null)}
                className="text-[#71717A] hover:text-black font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicaoMembro} className="p-5 space-y-4 text-left">
              <Input
                label="Nome Completo"
                required
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Ex: João da Silva"
              />

              <Input
                label="Telefone / WhatsApp"
                value={editTel}
                onChange={(e) => setEditTel(e.target.value)}
                placeholder="(45) 99999-9999"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                    Função na Célula
                  </label>
                  <select
                    value={editFuncao}
                    onChange={(e) => setEditFuncao(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-lg bg-white border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Membro">Membro</option>
                    <option value="Líder">Líder</option>
                    <option value="Vice-líder">Vice-líder</option>
                    <option value="Anfitrião">Anfitrião</option>
                    <option value="Líder em Treinamento">Líder em Treinamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                    Tempo na Célula
                  </label>
                  <select
                    value={editTempo}
                    onChange={(e) => setEditTempo(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg bg-white border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Recém-chegado">Recém-chegado</option>
                    <option value="3 meses">3 meses</option>
                    <option value="6 meses">6 meses</option>
                    <option value="1 ano+">1 ano ou mais</option>
                  </select>
                </div>
              </div>

              {/* Status de Batismo */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Batismo nas Águas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditBatizado(true)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      editBatizado
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0] ring-1 ring-[#166534]'
                        : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                    }`}
                  >
                    ✓ Batizado(a)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditBatizado(false)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      !editBatizado
                        ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA] ring-1 ring-[#991B1B]'
                        : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                    }`}
                  >
                    ✕ Não batizado(a)
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMembroParaEditar(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GERADOR DE CONVITES PARA LIDERANÇA (EXCLUSIVO LÍDERES DE 12 E PASTORES) */}
      {modalConvitesAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-xl overflow-hidden animate-fadeIn text-left">
            <div className="p-5 border-b border-[#F4F4F5] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                  <Crown className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0A0A0A]">
                    Gerar Convites de Liderança
                  </h3>
                  <p className="text-[11px] text-[#71717A]">
                    Somente Líderes de 12 e Pastores possuem permissão para convidar novos líderes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalConvitesAberto(false)}
                className="text-[#71717A] hover:text-[#0A0A0A] p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Opção 1: Convite para Líder de Célula */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-xs text-[#0A0A0A]">
                      Convite para Novo Líder de Célula
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    O líder recebe o link para registrar sua célula local, membros e batismos.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const url = `${origin}/cadastro-lider-celula?por=${encodeURIComponent(usuarioNomeLogado || 'Liderança dos 12')}`;
                      navigator.clipboard.writeText(url);
                      sucesso('Link de convite para Líder de Célula copiado!');
                    }}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-black text-[var(--accent,#FACC15)] hover:bg-[#27272A] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link de Célula</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Graça e paz! Segue o link oficial para você cadastrar a sua célula e ativar seu login de Líder na Eira Church: ${
                        typeof window !== 'undefined' ? window.location.origin : ''
                      }/cadastro-lider-celula?por=${encodeURIComponent(usuarioNomeLogado || 'Liderança dos 12')}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#22C55E] text-white hover:bg-[#16A34A] transition-colors flex items-center justify-center"
                    title="Enviar no WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Opção 2: Convite para Líder de 12 */}
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <h4 className="font-extrabold text-xs text-[#0A0A0A]">
                      Convite para Novo Líder de 12 (Discipulador)
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    O líder recebe acesso amplo à rede de células e autorização para gerar novos convites.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : '';
                      const url = `${origin}/cadastro-lider-12?por=${encodeURIComponent(usuarioNomeLogado || 'Liderança dos 12')}`;
                      navigator.clipboard.writeText(url);
                      sucesso('Link de convite para Líder de 12 copiado!');
                    }}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-[#F4F4F5] text-black border border-[#E4E4E7] hover:border-black transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link dos 12</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Graça e paz! Segue o link oficial para você cadastrar seu acesso como Líder de 12 na Eira Church: ${
                        typeof window !== 'undefined' ? window.location.origin : ''
                      }/cadastro-lider-12?por=${encodeURIComponent(usuarioNomeLogado || 'Liderança dos 12')}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#22C55E] text-white hover:bg-[#16A34A] transition-colors flex items-center justify-center"
                    title="Enviar no WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAFAFA] border-t border-[#E4E4E7] flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalConvitesAberto(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
