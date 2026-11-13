'use client';

// src/components/admin/AdminHeader.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAdminStore, AbaAdmin, TemaWhiteLabel, UsuarioRole } from '../../store/adminStore';
import { Button } from '../ui/Button';
import {
  LogOut,
  Calendar,
  Users,
  PlusCircle,
  Church,
  Palette,
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
} from 'lucide-react';

export interface AdminHeaderProps {
  onLogout?: () => void;
  igrejaNome?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onLogout,
  igrejaNome,
}) => {
  const {
    abaAtiva,
    setAbaAtiva,
    temaAtivo,
    setTemaAtivo,
    usuarioRole,
    setUsuarioRole,
    igrejaConfig,
    modoCor,
    setModoCor,
    visitantes,
    celulas,
  } = useAdminStore();

  const [menuNotificacoesAberto, setMenuNotificacoesAberto] = useState(false);
  const [notificacoesLidas, setNotificacoesLidas] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fecha menu de notificações ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setMenuNotificacoesAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const nomeExibicao = igrejaNome || igrejaConfig.nome || 'Eira Church';

  // Notificações em tempo real calculadas pelo perfil
  const notificacoes = useMemo(() => {
    const lista: {
      id: string;
      titulo: string;
      descricao: string;
      tipo: 'visitante' | 'inscricao' | 'celula';
      aba: AbaAdmin;
      destaque?: boolean;
    }[] = [];

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
        descricao: 'Novas pessoas cadastradas ou inscrições de eventos aparecerão aqui.',
        tipo: 'visitante',
        aba: 'dashboard',
      });
    }

    return lista;
  }, [visitantes, celulas, usuarioRole]);

  const contagemNaoLidas = notificacoes.filter(
    (n) => !notificacoesLidas.includes(n.id) && n.id !== 'notif-zerado'
  ).length;

  const marcarTodasLidas = () => {
    setNotificacoesLidas(notificacoes.map((n) => n.id));
  };

  const temas: { id: TemaWhiteLabel; nome: string; cor: string }[] = [
    { id: 'eira-signature', nome: 'Eira Amarelo', cor: '#FACC15' },
    { id: 'solar-amber', nome: 'Solar Âmbar', cor: '#F59E0B' },
    { id: 'royal-cobalt', nome: 'Royal Cobalto', cor: '#2563EB' },
    { id: 'emerald-life', nome: 'Emerald Verde', cor: '#10B981' },
    { id: 'monochrome', nome: 'Monochrome', cor: '#18181B' },
  ];

  // Abas disponíveis para líderes
  const abasBase = [
    { id: 'dashboard' as AbaAdmin, label: 'Painel Geral', icon: Church },
    { id: 'conexao' as AbaAdmin, label: 'Conexão // Visitantes', icon: HeartHandshake },
    { id: 'celulas' as AbaAdmin, label: 'Rede de Células', icon: Home },
    {
      id: 'inscricoes' as AbaAdmin,
      label: usuarioRole === 'lider' ? 'Inscrições' : 'Inscrições & Finanças',
      icon: Users,
    },
    { id: 'eventos' as AbaAdmin, label: 'Gerenciar Eventos', icon: Calendar },
    { id: 'novo-evento' as AbaAdmin, label: '+ Novo Evento', icon: PlusCircle },
  ];

  // Aba exclusiva para Pastor e Administrador
  const abasExtras =
    usuarioRole === 'pastor' || usuarioRole === 'admin'
      ? [
          {
            id: 'configuracao' as AbaAdmin,
            label: 'Configuração da Igreja',
            icon: Settings,
          },
        ]
      : [];

  const todasAbas = [...abasBase, ...abasExtras];

  return (
    <header className="w-full bg-white border-b border-[#E4E4E7] sticky top-0 z-40 transition-colors">
      {/* Barra Superior da Marca e Operador */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-[var(--radius-btn,0.5rem)] bg-[#0A0A0A] text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-lg border border-black shadow-sm">
            {nomeExibicao.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
                {nomeExibicao}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
                Painel Liderança
              </span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Gestão de Eventos, Células e Visitantes
            </p>
          </div>
        </div>

        {/* Controles de Lado Direito: Notificações, Perfil Ativo, Dark Mode, Tema e Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Central de Notificações com Badge */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setMenuNotificacoesAberto(!menuNotificacoesAberto)}
              className="relative p-2 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] text-[#0A0A0A] hover:border-black transition-colors cursor-pointer"
              title="Notificações da Liderança"
              aria-label="Abrir notificações"
            >
              <Bell className="w-4 h-4 text-[#0A0A0A]" />
              {contagemNaoLidas > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm animate-pulse">
                  {contagemNaoLidas}
                </span>
              )}
            </button>

            {/* Menu Dropdown de Notificações */}
            {menuNotificacoesAberto && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-xl z-50 overflow-hidden text-left">
                <div className="p-3.5 border-b border-[#F4F4F5] flex items-center justify-between bg-[#FAFAFA]">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-black" />
                    <span className="font-extrabold text-xs text-[#0A0A0A]">
                      Notificações & Atividades
                    </span>
                    {contagemNaoLidas > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">
                        {contagemNaoLidas} novas
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

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F4F5]">
                  {notificacoes.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAbaAtiva(item.aba);
                        setMenuNotificacoesAberto(false);
                      }}
                      className={`p-3.5 hover:bg-[#FAFAFA] transition-colors cursor-pointer space-y-1 ${
                        item.destaque ? 'bg-[#FEF08A]/15' : ''
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
                </div>
              </div>
            )}
          </div>

          {/* Badge do Papel Autenticado */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7]">
            <UserCheck className="w-3.5 h-3.5 text-[#71717A]" />
            <span className="text-xs font-extrabold text-[#0A0A0A] capitalize">
              {usuarioRole === 'pastor'
                ? 'Perfil: Pastor'
                : usuarioRole === 'admin'
                ? 'Perfil: ADM'
                : 'Perfil: Líder de Célula'}
            </span>
          </div>

          {/* Alternador de Modo Claro / Modo Escuro */}
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

          {/* Seletor Rápido de Paleta White Label */}
          <div className="hidden sm:flex items-center space-x-1.5 p-1 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7]">
            <Palette className="w-3.5 h-3.5 text-[#71717A] ml-1.5 mr-1" aria-hidden="true" />
            {temas.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemaAtivo(t.id)}
                title={`Mudar tema para ${t.nome}`}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  temaAtivo === t.id
                    ? 'ring-2 ring-black scale-110'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: t.cor }}
                aria-label={`Tema ${t.nome}`}
              />
            ))}
          </div>

          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              aria-label="Sair do painel administrativo"
            >
              <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar border-t border-[#F4F4F5]">
        <nav aria-label="Abas do painel" className="flex space-x-1 py-1">
          {todasAbas.map((item) => {
            const isAtiva = abaAtiva === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold rounded-[var(--radius-btn,0.5rem)] transition-colors whitespace-nowrap cursor-pointer ${
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
