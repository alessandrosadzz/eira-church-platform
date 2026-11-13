'use client';

// src/components/admin/ConexaoView.tsx

import React, { useState, useMemo } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { VisitanteConexao } from '../../types/igreja';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  HeartHandshake,
  UserPlus,
  Search,
  MessageCircle,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Trash2,
  ChevronRight,
  Share2,
} from 'lucide-react';

export const ConexaoView: React.FC = () => {
  const { sucesso, info } = useToast();
  const {
    visitantes,
    adicionarVisitante,
    atualizarStatusVisitante,
    removerVisitante,
    igrejaConfig,
  } = useAdminStore();

  // Estados de controle da interface
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'novo' | 'em_contato' | 'integrado'
  >('todos');
  const [filtroSexo, setFiltroSexo] = useState<'todos' | 'Homem' | 'Mulher' | 'Casal'>('todos');
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalQrAberto, setModalQrAberto] = useState(false);

  // Link de auto-cadastro do visitante
  const linkAutoCadastro = typeof window !== 'undefined' ? `${window.location.origin}/boas-vindas` : '/boas-vindas';

  const handleCopiarLinkVisitante = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(linkAutoCadastro);
      sucesso('Link de auto-cadastro copiado! Envie ou disponibilize aos visitantes.');
    }
  };

  // Estados do formulário de cadastro rápido
  const [novoNome, setNovoNome] = useState('');
  const [novoSexo, setNovoSexo] = useState<'Homem' | 'Mulher' | 'Casal'>('Homem');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoQuemConvidou, setNovoQuemConvidou] = useState('');
  const [novaFaixaEtaria, setNovaFaixaEtaria] = useState<
    VisitanteConexao['faixa_etaria']
  >('Jovem (18-29)');
  const [novoQuerCelula, setNovoQuerCelula] = useState(true);
  const [novoPedidoOracao, setNovoPedidoOracao] = useState('');
  const [novoCadastradoPor, setNovoCadastradoPor] = useState('Equipe Conexão');

  // Métricas rápidas
  const metricas = useMemo(() => {
    const total = visitantes.length;
    const novos = visitantes.filter((v) => v.status === 'novo').length;
    const querCelula = visitantes.filter((v) => v.quer_celula).length;
    const taxaCelula = total > 0 ? Math.round((querCelula / total) * 100) : 0;
    return { total, novos, taxaCelula };
  }, [visitantes]);

  // Lista filtrada
  const visitantesFiltrados = useMemo(() => {
    return visitantes.filter((v) => {
      const matchBusca =
        !busca.trim() ||
        v.nome.toLowerCase().includes(busca.toLowerCase()) ||
        v.bairro.toLowerCase().includes(busca.toLowerCase()) ||
        v.quem_convidou.toLowerCase().includes(busca.toLowerCase());

      const matchStatus =
        filtroStatus === 'todos' || v.status === filtroStatus;

      const matchSexo =
        filtroSexo === 'todos' || (v.sexo || 'Homem') === filtroSexo;

      return matchBusca && matchStatus && matchSexo;
    });
  }, [visitantes, busca, filtroStatus, filtroSexo]);

  // Salvar novo visitante
  const handleSalvarVisitante = (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoNome.trim()) {
      info('Informe o nome da pessoa nova.');
      return;
    }

    if (!novoTelefone.trim()) {
      info('Informe o WhatsApp para contato.');
      return;
    }

    adicionarVisitante({
      nome: novoNome.trim(),
      sexo: novoSexo,
      telefone: novoTelefone.trim(),
      bairro: novoBairro.trim() || 'Não informado',
      quem_convidou: novoQuemConvidou.trim() || 'Culto de Domingo',
      faixa_etaria: novaFaixaEtaria,
      quer_celula: novoQuerCelula,
      pedido_oracao: novoPedidoOracao.trim() || undefined,
      data_visita: new Date().toISOString().split('T')[0],
      status: 'novo',
      cadastrado_por: novoCadastradoPor.trim(),
    });

    sucesso(`${novoNome.trim()} cadastrado(a) na Conexão com sucesso!`);

    // Limpa formulário e fecha modal
    setNovoNome('');
    setNovoSexo('Homem');
    setNovoTelefone('');
    setNovoBairro('');
    setNovoQuemConvidou('');
    setNovoPedidoOracao('');
    setModalCadastroAberto(false);
  };

  // Enviar mensagem de boas-vindas no WhatsApp
  const handleEnviarMensagemWhatsApp = (v: VisitanteConexao) => {
    const apenasDigitos = v.telefone.replace(/\D/g, '');
    const numeroFormatado =
      apenasDigitos.length <= 11 ? `55${apenasDigitos}` : apenasDigitos;

    const primeiroNome = v.nome.split(' ')[0];
    const mensagem = encodeURIComponent(
      `Olá ${primeiroNome}! Que alegria enorme ter você conosco na ${igrejaConfig.nome}! 💛\n\nEsperamos que você tenha se sentido muito bem acolhido(a). Se precisar de uma oração ou quiser conhecer uma célula perto de você no ${v.bairro}, pode contar conosco!\n\nDeus abençoe muito sua semana!`
    );

    window.open(`https://wa.me/${numeroFormatado}?text=${mensagem}`, '_blank');
    atualizarStatusVisitante(v.id, 'em_contato');
    info(`Iniciando contato via WhatsApp com ${primeiroNome}.`);
  };

  return (
    <div className="space-y-6 text-left w-full max-w-7xl mx-auto">
      {/* ==================================================== */}
      {/* CABEÇALHO DO MÓDULO CONEXÃO */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
              <HeartHandshake className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              Módulo Conexão // Pessoas Novas & Visitantes
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#71717A]">
            Acolha visitantes no culto pelo celular, registre bairro e oração, e envie mensagem de boas-vindas com 1 toque.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            className="flex-1 sm:flex-initial"
            onClick={handleCopiarLinkVisitante}
            title="Copiar link para o próprio visitante preencher no celular dele"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span>Link do Visitante</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            className="flex-1 sm:flex-initial shadow-md"
            onClick={() => setModalCadastroAberto(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Cadastrar Pessoa</span>
          </Button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* CARDS DE MÉTRICAS RÁPIDAS DA CONEXÃO */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
              Total de Acolhidos
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
              {metricas.total}
            </p>
            <span className="text-xs text-[#52525B]">Neste mês</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F4F4F5] text-[#0A0A0A]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
              Novos (Aguardando Contato)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
              {metricas.novos}
            </p>
            <span className="text-xs text-[#EAB308] font-bold">Chamar no WhatsApp</span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
              Interesse em Célula
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tabular-nums mt-1">
              {metricas.taxaCelula}%
            </p>
            <span className="text-xs text-[#16A34A] font-bold">Desejam acompanhamento</span>
          </div>
          <div className="p-3 rounded-lg bg-[#DCFCE7] text-[#166534]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* FILTROS E BUSCA RESPONSIVA */}
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
            placeholder="Buscar por nome, bairro ou quem convidou..."
            className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-sm text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        {/* Filtros por Status e Gênero */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status */}
          <div className="flex items-center overflow-x-auto space-x-1.5 no-scrollbar">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'novo', label: 'Novos' },
              { id: 'em_contato', label: 'Em Contato' },
              { id: 'integrado', label: 'Integrados em Célula' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFiltroStatus(st.id as any)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroStatus === st.id
                    ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-sm'
                    : 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7] hover:border-black'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Gênero / Rede */}
          <div className="flex items-center space-x-1 border-l border-[#E4E4E7] pl-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'Homem', label: '👨 Homens' },
              { id: 'Mulher', label: '👩 Mulheres' },
              { id: 'Casal', label: '👫 Casais' },
            ].map((sx) => (
              <button
                key={sx.id}
                onClick={() => setFiltroSexo(sx.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filtroSexo === sx.id
                    ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-sm'
                    : 'bg-[#FAFAFA] text-[#71717A] border border-[#E4E4E7] hover:border-black'
                }`}
              >
                {sx.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* LISTA / CARDS DOS VISITANTES (MOBILE FIRST) */}
      {/* ==================================================== */}
      {visitantesFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] space-y-3">
          <HeartHandshake className="w-10 h-10 text-[#A1A1AA] mx-auto" />
          <h3 className="text-base font-bold text-[#0A0A0A]">
            Nenhum visitante encontrado
          </h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Não há registros com os filtros atuais. Use o botão acima para cadastrar a primeira pessoa acolhida.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitantesFiltrados.map((v) => {
            const statusConfig = {
              novo: {
                label: 'Novo Acolhimento',
                cor: 'bg-[#FEF08A] text-[#854D0E] border-[#FDE047]',
              },
              em_contato: {
                label: 'Em Contato WhatsApp',
                cor: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
              },
              integrado: {
                label: 'Integrado em Célula',
                cor: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
              },
            }[v.status];

            return (
              <div
                key={v.id}
                className="p-5 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm flex flex-col justify-between space-y-4 hover:border-black transition-colors"
              >
                <div className="space-y-2.5">
                  {/* Cabeçalho do Card: Nome e Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base text-[#0A0A0A]">
                        {v.nome}
                      </h4>
                      <p className="text-xs text-[#71717A] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span>Bairro {v.bairro}</span>
                        <span>•</span>
                        <span>{v.faixa_etaria}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-wrap justify-end gap-y-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                          v.sexo === 'Mulher'
                            ? 'bg-[#FDF2F8] text-[#9D174D] border-[#FBCFE8]'
                            : v.sexo === 'Casal'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                            : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
                        }`}
                      >
                        {v.sexo === 'Mulher' ? '👩 Mulher' : v.sexo === 'Casal' ? '👫 Casal' : '👨 Homem'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${statusConfig.cor}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Informações de Acolhimento */}
                  <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#F4F4F5] text-xs space-y-1.5">
                    <p className="text-[#52525B]">
                      <strong className="text-[#0A0A0A]">Quem convidou:</strong> {v.quem_convidou}
                    </p>
                    <p className="text-[#52525B]">
                      <strong className="text-[#0A0A0A]">Interesse em Célula:</strong>{' '}
                      {v.quer_celula ? (
                        <span className="text-[#16A34A] font-bold">Sim, quer participar!</span>
                      ) : (
                        <span className="text-[#71717A]">Ainda não tem interesse</span>
                      )}
                    </p>
                    {v.pedido_oracao && (
                      <p className="text-[#52525B]">
                        <strong className="text-[#0A0A0A]">Pedido de Oração:</strong>{' '}
                        <span className="italic">"{v.pedido_oracao}"</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[#A1A1AA] pt-1">
                      Data da visita: {v.data_visita} • Cadastrado por: {v.cadastrado_por || 'Conexão'}
                    </p>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="pt-3 border-t border-[#F4F4F5] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <select
                      value={v.status}
                      onChange={(e) =>
                        atualizarStatusVisitante(v.id, e.target.value as any)
                      }
                      className="h-9 px-2 text-xs font-bold rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-[#0A0A0A]"
                      aria-label="Mudar status de acolhimento"
                    >
                      <option value="novo">Status: Novo</option>
                      <option value="em_contato">Status: Em Contato</option>
                      <option value="integrado">Status: Integrado</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => removerVisitante(v.id)}
                      className="p-2 text-[#A1A1AA] hover:text-[#EF4444] rounded-lg transition-colors cursor-pointer"
                      title="Excluir cadastro"
                      aria-label="Excluir visitante"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEnviarMensagemWhatsApp(v)}
                    className="flex-1 sm:flex-initial"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL DE CADASTRO RÁPIDO // CELULAR / TABLET */}
      {/* ==================================================== */}
      {modalCadastroAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                  <UserPlus className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Cadastrar Pessoa Nova no Culto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCadastroAberto(false)}
                className="text-[#71717A] hover:text-black font-bold text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSalvarVisitante}
              className="p-5 overflow-y-auto space-y-4 text-left flex-1"
            >
              <Input
                label="Nome Completo do Visitante"
                required
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Amanda Ferreira"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Gênero / Rede de Célula Indicada
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Homem', 'Mulher', 'Casal'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNovoSexo(s)}
                      className={`h-11 rounded-lg border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        novoSexo === s
                          ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm'
                          : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                      }`}
                    >
                      <span>{s === 'Homem' ? '👨 Homem' : s === 'Mulher' ? '👩 Mulher' : '👫 Casal'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="WhatsApp com DDD"
                required
                type="tel"
                value={novoTelefone}
                onChange={(e) => setNovoTelefone(e.target.value)}
                placeholder="(45) 99881-2233"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Bairro onde mora"
                  value={novoBairro}
                  onChange={(e) => setNovoBairro(e.target.value)}
                  placeholder="Ex: Coqueiral / Cascavel"
                />

                <Input
                  label="Quem convidou?"
                  value={novoQuemConvidou}
                  onChange={(e) => setNovoQuemConvidou(e.target.value)}
                  placeholder="Ex: Amigo da célula / Culto"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                    Faixa Etária
                  </label>
                  <select
                    value={novaFaixaEtaria}
                    onChange={(e) => setNovaFaixaEtaria(e.target.value as any)}
                    className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <option value="Criança">Criança (Eira Kids)</option>
                    <option value="Adolescente (12-17)">Adolescente (12-17 // Hype)</option>
                    <option value="Jovem (18-29)">Jovem (18-29 // One Way)</option>
                    <option value="Adulto">Adulto</option>
                    <option value="Melhor Idade">Melhor Idade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                    Deseja participar de uma célula?
                  </label>
                  <button
                    type="button"
                    onClick={() => setNovoQuerCelula(!novoQuerCelula)}
                    className={`w-full h-12 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                      novoQuerCelula
                        ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                        : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'
                    }`}
                  >
                    <span>{novoQuerCelula ? '✓ Sim, quer conhecer' : 'Ainda não'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Pedido de Oração ou Observação (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={novoPedidoOracao}
                  onChange={(e) => setNovoPedidoOracao(e.target.value)}
                  placeholder="Ex: Pediu oração pela família, está de mudança para a cidade..."
                  className="w-full p-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                />
              </div>

              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setModalCadastroAberto(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Visitante
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
