'use client';

// src/components/admin/AdminHeader.tsx

import React from 'react';
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
  } = useAdminStore();

  const nomeExibicao = igrejaNome || igrejaConfig.nome || 'Eira Church';

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

        {/* Controles de Lado Direito: Seletor de Papel, Dark Mode, Tema e Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Seletor de Papel (Role) para alternar entre Líder, Pastor e Admin */}
          <div className="flex items-center space-x-1 bg-[#FAFAFA] border border-[#E4E4E7] p-1 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-[#71717A] ml-1" />
            <select
              value={usuarioRole}
              onChange={(e) => setUsuarioRole(e.target.value as UsuarioRole)}
              className="text-xs font-bold bg-transparent text-[#0A0A0A] border-none focus:outline-none cursor-pointer py-0.5 pr-1"
              aria-label="Selecionar papel do usuário"
            >
              <option value="admin">Administrador</option>
              <option value="pastor">Pastor</option>
              <option value="lider">Líder de Célula</option>
            </select>
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
