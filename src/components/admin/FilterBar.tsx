'use client';

// src/components/admin/FilterBar.tsx

import React from 'react';
import { useAdminStore } from '../../store/adminStore';
import { Evento } from '../../types/evento';
import { StatusInscricao, MetodoPagamento } from '../../types/inscricao';
import { Button } from '../ui/Button';
import { Search, Download, RefreshCw, Filter, X } from 'lucide-react';

export interface FilterBarProps {
  eventos: Evento[];
  onExportarCsv: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  eventos,
  onExportarCsv,
  onRefresh,
  isRefreshing = false,
}) => {
  const { filtros, setFiltros, resetFiltros, usuarioRole } = useAdminStore();
  const temFiltroAtivo =
    Boolean(filtros.busca) ||
    Boolean(filtros.evento_id) ||
    filtros.status !== 'todos' ||
    filtros.metodo_pag !== 'todos';

  return (
    <div className="w-full bg-white p-4 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Campo de Busca Texto */}
        <div className="relative lg:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
            <Search className="w-4 h-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={filtros.busca}
            onChange={(e) => setFiltros({ busca: e.target.value })}
            placeholder="Buscar por nome, WhatsApp ou e-mail..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-[#0A0A0A] placeholder-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        {/* Filtro por Evento (Conciso) */}
        <div>
          <select
            value={filtros.evento_id}
            onChange={(e) => setFiltros({ evento_id: e.target.value })}
            aria-label="Filtrar por evento"
            className="w-full h-10 px-2.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Evento: Todos</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Status (Conciso) */}
        <div>
          <select
            value={filtros.status}
            onChange={(e) =>
              setFiltros({ status: e.target.value as StatusInscricao | 'todos' })
            }
            aria-label="Filtrar por status"
            className="w-full h-10 px-2.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="todos">Status: Todos</option>
            <option value="pago">Status: Confirmado</option>
            <option value="pendente">Status: Pendente</option>
            <option value="isento">Status: Gratuito</option>
          </select>
        </div>

        {/* Filtro por Método de Pagamento (Conciso) */}
        <div>
          <select
            value={filtros.metodo_pag}
            onChange={(e) =>
              setFiltros({
                metodo_pag: e.target.value as MetodoPagamento | 'todos',
              })
            }
            aria-label="Filtrar por forma de pagamento"
            className="w-full h-10 px-2.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-xs font-medium text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="todos">Pagamento: Todos</option>
            <option value="pix">Pix</option>
            <option value="cartao">Cartão de Crédito</option>
            <option value="dinheiro">Dinheiro // Balcão</option>
            <option value="isento">Isento</option>
          </select>
        </div>
      </div>

      {/* Linha Inferior com Ações Rápidas */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#F4F4F5] gap-2 text-xs">
        <div className="flex items-center space-x-2">
          {temFiltroAtivo && (
            <button
              onClick={resetFiltros}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#F4F4F5] text-[#52525B] hover:text-black font-semibold cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              aria-label="Atualizar dados"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>Atualizar</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportarCsv}
            aria-label="Exportar relatório para Excel em CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>Exportar CSV</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
