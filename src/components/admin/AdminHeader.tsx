'use client';

// src/components/admin/AdminHeader.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAdminStore, AbaAdmin, UsuarioRole } from '../../store/adminStore';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  LogOut,
  Calendar,
  Users,
  PlusCircle,
  Church,
  HeartHandshake,
  Settings,
  Home,
  UserCheck,
  Sun,
  Moon,
  Bell,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  X,
  Lock,
  ChevronDown,
} from 'lucide-react';

export interface AdminHeaderProps {
  onLogout?: () => void;
  igrejaNome?: string;
  onAtualizar?: () => Promise<void> | void;
  carregando?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onLogout,
  igrejaNome,
  onAtualizar,
  carregando = false,
}) => {
  const { sucesso, erro } = useToast();
  const {
    abaAtiva,
    setAbaAtiva,
    usuarioRole,
    usuarioNomeLogado,
    setUsuarioRole,
    igrejaConfig,
    modoCor,
    setModoCor,
    visitantes,
    celulas,
    atividadesLideres,
    marcarAtividadesLideresLidas,
    alterarSenhaUsuario,
  } = useAdminStore();

  const [menuNotificacoesAberto, setMenuNotificacoesAberto] = useState(false);
  const [menuPerfilAberto, setMenuPerfilAberto] = useState(false);
  const [modalMinhaSenhaAberto, setModalMinhaSenhaAberto] = useState(false);
  const [novaMinhaSenha, setNovaMinhaSenha] = useState('');
  const [mostrarMinhaSenha, setMostrarMinhaSenha] = useState(false);
  const [salvandoMinhaSenha, setSalvandoMinhaSenha] = useState(false);

  const [abaNotifAtiva, setAbaNotifAtiva] = useState<'todas' | 'lideres'>('todas');
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const perfilRef = useRef<HTMLDivElement>(null);

  // Fecha menus ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setMenuNotificacoesAberto(false);
      }
      if (perfilRef.current && !perfilRef.current.contains(e.target as Node)) {
        setMenuPerfilAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const handleSalvarMinhaSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMinhaSenha.trim() || novaMinhaSenha.length < 4) {
      erro('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setSalvandoMinhaSenha(true);
    try {
      await alterarSenhaUsuario(usuarioNomeLogado || 'pastores', novaMinhaSenha.trim());
      sucesso('Sua senha foi alterada com sucesso!');
      setModalMinhaSenhaAberto(false);
      setNovaMinhaSenha('');
      setMenuPerfilAberto(false);
    } catch {
      erro('Não foi possível alterar sua senha.');
    } finally {
      setSalvandoMinhaSenha(false);
    }
  };

  const nomeExibicao = igrejaNome || igrejaConfig.nome || 'Eira Church';

  // Notificações gerais calculadas pelo perfil
  const notificacoes = useMemo(() => {
    const lista: {
      id: string;
      titulo: string;
      descricao: string;
      tipo: 'visitante' | 'inscricao' | 'celula' | 'lider';
      aba: AbaAdmin;
      destaque?: boolean;
      timestamp?: string;
    }[] = [];

    // Notificações de atividades dos líderes (para Pastores e Admins)
    if (usuarioRole === 'pastor' || usuarioRole === 'admin') {
      atividadesLideres.forEach((atv) => {
        lista.push({
          id: atv.id,
          titulo: `📋 ${atv.titulo}`,
          descricao: atv.descricao,
          tipo: 'lider',
          aba: 'celulas',
          destaque: !atv.lida,
          timestamp: atv.timestamp,
        });
      });
    }

    const novosVisitantes = visitantes.filter((v) => v.status === 'novo');
    if (novosVisitantes.length > 0) {
      lista.push({
        id: 'notif-novos-vis',
        titulo: `🎉 ${novosVisitantes.length} ${novosVisitantes.length === 1 ? 'pessoa nova cadastrada' : 'pessoas novas cadastradas'}!`,
        descricao:
          usuarioRole === 'lider'
            ? 'Pessoas acolhidas no culto querendo conhecer células no bairro.'
            : 'Novos visitantes aguardando acompanhamento da equipe da Conexão.',
        tipo: 'visitante',
        aba: 'conexao',
        destaque: true,
      });
    }

    if (celulas.length > 0 && (usuarioRole === 'pastor' || usuarioRole === 'admin')) {
      lista.push({
        id: 'notif-celulas-rede',
        titulo: `📍 ${celulas.length} células ativas na rede`,
        descricao: 'Controle de frequência, batizados e endereços com Google Maps.',
        tipo: 'celula',
        aba: 'celulas',
      });
    }

    if (lista.length === 0) {
      lista.push({
        id: 'notif-zerado',
        titulo: 'Tudo em dia!',
        descricao: 'Novas pessoas cadastradas ou atualizações dos líderes aparecerão aqui.',
        tipo: 'visitante',
        aba: 'dashboard',
      });
    }

    return lista;
  }, [visitantes, celulas, usuarioRole, atividadesLideres]);

  const notificacoesLideres = useMemo(() => {
    return notificacoes.filter((n) => n.tipo === 'lider');
  }, [notificacoes]);

  const contagemNaoLidas = notificacoes.filter(
    (n) => !notificacoesLidas.includes(n.id) && n.id !== 'notif-zerado'
  ).length;

  const contagemLideresNaoLidas = notificacoesLideres.filter(
    (n) => !notificacoesLidas.includes(n.id)
  ).length;

  const marcarTodasLidas = () => {
    setNotificacoesLidas(notificacoes.map((n) => n.id));
    marcarAtividadesLideresLidas();
  };

  const isConexao = usuarioRole === 'conexao';
  const isLiderCelula = usuarioRole === 'lider_celula' || usuarioRole === 'lider';
  const isLider12 = usuarioRole === 'lider_12';
  const isDiretoria = usuarioRole === 'pastor' || usuarioRole === 'admin';

  // Configuração estrita de abas por perfil
  const todasAbas = useMemo(() => {
    if (isConexao) {
      return [
        { id: 'conexao' as AbaAdmin, label: 'Conexão // Visitantes', icon: HeartHandshake },
      ];
    }

    if (isLiderCelula) {
      return [
        { id: 'dashboard' as AbaAdmin, label: 'Painel da Célula', icon: Church },
        { id: 'celulas' as AbaAdmin, label: 'Minha Célula', icon: Home },
        { id: 'conexao' as AbaAdmin, label: 'Pessoas do Meu Bairro', icon: HeartHandshake },
      ];
    }

    if (isLider12) {
      return [
        { id: 'dashboard' as AbaAdmin, label: 'Painel da Rede', icon: Church },
        { id: 'conexao' as AbaAdmin, label: 'Conexão // Visitantes', icon: HeartHandshake },
        { id: 'celulas' as AbaAdmin, label: 'Rede de Células', icon: Home },
        { id: 'inscricoes' as AbaAdmin, label: 'Gestão de Inscrições', icon: Users },
        { id: 'eventos' as AbaAdmin, label: 'Eventos Oficiais', icon: Calendar },
      ];
    }

    // Diretoria (Pastor & Admin)
    return [
      { id: 'dashboard' as AbaAdmin, label: 'Painel Geral', icon: Church },
      { id: 'conexao' as AbaAdmin, label: 'Conexão // Visitantes', icon: HeartHandshake },
      { id: 'celulas' as AbaAdmin, label: 'Rede de Células', icon: Home },
      { id: 'inscricoes' as AbaAdmin, label: 'Inscrições & Finanças', icon: Users },
      { id: 'eventos' as AbaAdmin, label: 'Gerenciar Eventos', icon: Calendar },
      { id: 'novo-evento' as AbaAdmin, label: '+ Novo Evento', icon: PlusCircle },
      { id: 'configuracao' as AbaAdmin, label: 'Configuração da Igreja', icon: Settings },
    ];
  }, [isConexao, isLiderCelula, isLider12, isDiretoria]);

  return (
    <header className="w-full bg-white border-b border-[#E4E4E7] sticky top-0 z-40 transition-colors">
      {/* Barra Superior da Marca e Operador */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[var(--radius-btn,0.5rem)] bg-[#0A0A0A] text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-sm sm:text-base border border-black shadow-sm overflow-hidden shrink-0">
            {igrejaConfig?.logoUrl ? (
              <img
                src={igrejaConfig.logoUrl}
                alt={nomeExibicao}
                className="w-full h-full object-contain p-0.5 sm:p-1"
              />
            ) : (
              nomeExibicao.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#0A0A0A] truncate">
                {nomeExibicao}
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
                Painel Liderança
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] hidden sm:block truncate">
              Gestão de Eventos, Células e Visitantes
            </p>
          </div>
        </div>

        {/* Controles de Lado Direito: Notificações, Atualizar Supabase, Perfil Interativo */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Botão de Sincronizar / Atualizar Supabase */}
          {onAtualizar && (
            <button
              type="button"
              onClick={onAtualizar}
              disabled={carregando}
              className={`flex items-center space-x-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#0A0A0A] hover:border-black transition-colors cursor-pointer text-xs font-bold min-h-[38px] ${
                carregando ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Atualizar dados em tempo real com o Supabase"
              aria-label="Atualizar dados do Supabase"
            >
              <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${carregando ? 'animate-spin text-black' : 'text-[#52525B]'}`} />
              <span className="hidden md:inline">Atualizar</span>
            </button>
          )}

          {/* Central de Notificações com Badge Discreto */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setMenuNotificacoesAberto(!menuNotificacoesAberto)}
              className="relative p-2 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#0A0A0A] hover:border-black transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Notificações e Atualizações dos Líderes"
              aria-label="Abrir notificações"
            >
              <Bell className="w-4 h-4 text-[#0A0A0A]" />
              {contagemNaoLidas > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent,#FACC15)] ring-1.5 ring-white" />
              )}
            </button>

            {/* Menu Dropdown de Notificações */}
            {menuNotificacoesAberto && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-xl z-50 overflow-hidden text-left animate-fadeIn">
                <div className="p-3.5 border-b border-[#F4F4F5] flex items-center justify-between bg-[#FAFAFA]">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-black" />
                    <span className="font-extrabold text-xs text-[#0A0A0A]">
                      Atualizações & Notificações
                    </span>
                    {contagemNaoLidas > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF08A] text-[#854D0E]">
                        {contagemNaoLidas} pendentes
                      </span>
                    )}
                  </div>
                  {contagemNaoLidas > 0 && (
                    <button
                      onClick={marcarTodasLidas}
                      className="text-[11px] font-bold text-[#71717A] hover:text-black cursor-pointer"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                {/* Abas Internas para Pastores e Admins */}
                {(usuarioRole === 'pastor' || usuarioRole === 'admin') && (
                  <div className="grid grid-cols-2 p-1.5 bg-[#F4F4F5] border-b border-[#E4E4E7] text-xs font-bold gap-1">
                    <button
                      type="button"
                      onClick={() => setAbaNotifAtiva('todas')}
                      className={`py-1.5 rounded-md transition-colors ${
                        abaNotifAtiva === 'todas'
                          ? 'bg-white text-black shadow-xs font-extrabold'
                          : 'text-[#71717A] hover:text-black'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbaNotifAtiva('lideres')}
                      className={`py-1.5 rounded-md transition-colors flex items-center justify-center space-x-1 ${
                        abaNotifAtiva === 'lideres'
                          ? 'bg-white text-black shadow-xs font-extrabold'
                          : 'text-[#71717A] hover:text-black'
                      }`}
                    >
                      <span>Líderes</span>
                      {contagemLideresNaoLidas > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent,#FACC15)]" />
                      )}
                    </button>
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F4F5]">
                  {(abaNotifAtiva === 'lideres' ? notificacoesLideres : notificacoes).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAbaAtiva(item.aba);
                        setMenuNotificacoesAberto(false);
                      }}
                      className={`p-3.5 hover:bg-[#FAFAFA] transition-colors cursor-pointer space-y-1 ${
                        item.destaque ? 'bg-[#FEF9C3]/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#0A0A0A]">
                          {item.titulo}
                        </span>
                        <span className="text-[10px] font-bold text-black flex items-center space-x-0.5 hover:underline">
                          <span>Ver</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-[#52525B] leading-relaxed">
                        {item.descricao}
                      </p>
                    </div>
                  ))}
                  {abaNotifAtiva === 'lideres' && notificacoesLideres.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#71717A]">
                      Nenhuma atualização recente da liderança no momento.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu Interativo de Perfil & Alteração de Senha */}
          <div className="relative" ref={perfilRef}>
            <button
              type="button"
              onClick={() => setMenuPerfilAberto(!menuPerfilAberto)}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] hover:border-black transition-colors cursor-pointer min-h-[38px]"
              title="Meu Perfil e Opções da Conta"
              aria-label="Abrir menu de perfil"
            >
              <UserCheck className="w-4 h-4 text-[#0A0A0A]" />
              <span className="text-xs font-extrabold text-[#0A0A0A] capitalize">
                {usuarioRole === 'pastor'
                  ? 'Pastor'
                  : usuarioRole === 'admin'
                  ? 'ADM'
                  : usuarioRole === 'lider_12'
                  ? 'Rede 12'
                  : usuarioRole === 'conexao'
                  ? 'Conexão'
                  : 'Célula'}
              </span>
              <ChevronDown className={`w-3 h-3 text-[#71717A] transition-transform ${menuPerfilAberto ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown do Perfil */}
            {menuPerfilAberto && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-xl z-50 overflow-hidden text-left animate-fadeIn divide-y divide-[#F4F4F5]">
                <div className="p-3 bg-[#FAFAFA]">
                  <p className="text-[10px] font-bold uppercase text-[#71717A]">
                    Operador Conectado
                  </p>
                  <p className="text-xs font-black text-[#0A0A0A] truncate mt-0.5">
                    {usuarioNomeLogado || 'Liderança Eira'}
                  </p>
                  <p className="text-[11px] text-[#52525B]">
                    Função: {usuarioRole === 'pastor' ? 'Pastor da Igreja' : usuarioRole === 'admin' ? 'Administrador Geral' : usuarioRole === 'lider_12' ? 'Líder de Rede (12)' : usuarioRole === 'conexao' ? 'Equipe Conexão' : 'Líder de Célula'}
                  </p>
                </div>

                <div className="p-1.5 space-y-1">
                  {/* Botão Mudar Minha Senha */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuPerfilAberto(false);
                      setNovaMinhaSenha('');
                      setMostrarMinhaSenha(false);
                      setModalMinhaSenhaAberto(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-md transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Alterar Minha Senha</span>
                  </button>

                  {/* Alternar Tema */}
                  <button
                    type="button"
                    onClick={() => setModoCor(modoCor === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#0A0A0A] hover:bg-[#F4F4F5] rounded-md transition-colors cursor-pointer"
                  >
                    {modoCor === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-[var(--accent,#FACC15)]" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-[#52525B]" />
                    )}
                    <span>{modoCor === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}</span>
                  </button>
                </div>

                {onLogout && (
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuPerfilAberto(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair do Painel</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Alterar Minha Senha */}
      {modalMinhaSenhaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#F4F4F5] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0A0A0A]">
                    Alterar Minha Senha
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    {usuarioNomeLogado || 'Minha Conta'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMinhaSenhaAberto(false)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarMinhaSenha} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Digite sua Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarMinhaSenha ? 'text' : 'password'}
                    required
                    value={novaMinhaSenha}
                    onChange={(e) => setNovaMinhaSenha(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarMinhaSenha(!mostrarMinhaSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#0A0A0A] p-1 cursor-pointer"
                    aria-label={mostrarMinhaSenha ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {mostrarMinhaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F4F4F5]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setModalMinhaSenhaAberto(false)}
                  disabled={salvandoMinhaSenha}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={salvandoMinhaSenha}
                >
                  {salvandoMinhaSenha ? 'Salvando...' : 'Salvar Nova Senha'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navegação de Abas com Espaçamento Amigável no Mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-[#F4F4F5]">
        <nav aria-label="Abas do painel" className="flex space-x-1.5 py-2 sm:py-2.5">
          {todasAbas.map((item) => {
            const isAtiva = abaAtiva === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-[var(--radius-btn,0.5rem)] transition-colors whitespace-nowrap cursor-pointer shrink-0 min-h-[38px] ${
                  isAtiva
                    ? 'bg-[#0A0A0A] text-white shadow-sm'
                    : 'text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isAtiva ? 'text-[var(--accent,#FACC15)]' : 'text-current'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
