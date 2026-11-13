'use client';

// src/components/admin/DataTable.tsx

import React from 'react';
import { Inscricao, MetodoPagamento } from '../../types/inscricao';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatarDataHora } from '../../lib/formatters';
import { AlertTriangle, CheckCircle, RotateCcw, Lock } from 'lucide-react';

export interface DataTableProps {
  inscricoes: Inscricao[];
  onAbrirBaixaManual: (inscricao: Inscricao) => void;
  onReverterStatus?: (inscricaoId: string) => void;
  isLoading?: boolean;
  podeConfirmarBaixa?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  inscricoes,
  onAbrirBaixaManual,
  onReverterStatus,
  isLoading = false,
  podeConfirmarBaixa = true,
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E4E4E7] p-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-bold text-[#71717A]">Carregando inscrições da igreja...</p>
      </div>
    );
  }

  if (inscricoes.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E4E4E7] p-12 text-center space-y-2">
        <p className="text-base font-bold text-[#0A0A0A]">Nenhuma inscrição encontrada</p>
        <p className="text-xs text-[#71717A] max-w-sm mx-auto">
          Nenhum participante corresponde aos filtros selecionados. Tente ajustar os termos de busca ou filtros de evento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-[#E4E4E7] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#E4E4E7] text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4">Participante</th>
              <th scope="col" className="py-3.5 px-4">Evento // Rede</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4">Método</th>
              <th scope="col" className="py-3.5 px-4">Saúde / Obs</th>
              <th scope="col" className="py-3.5 px-4">Data</th>
              <th scope="col" className="py-3.5 px-4 text-right">
                {podeConfirmarBaixa ? 'Ações da Secretaria' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {inscricoes.map((inscricao) => {
              const metodoFormatado = {
                pix: 'Pix',
                cartao: 'Cartão',
                dinheiro: 'Dinheiro',
                isento: 'Isento',
              }[inscricao.metodo_pag || ''] || '—';

              return (
                <tr
                  key={inscricao.id}
                  className="hover:bg-[#FAFAFA] transition-colors duration-100"
                >
                  {/* Participante */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0A0A0A]">{inscricao.nome}</div>
                    <div className="text-xs text-[#71717A]">
                      {inscricao.telefone || inscricao.email || 'Sem contato'}
                    </div>
                  </td>

                  {/* Evento */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#0A0A0A] text-xs block">
                      {inscricao.evento?.nome || 'Evento Geral'}
                    </span>
                    <span className="text-[10px] font-bold text-[#71717A] uppercase">
                      {inscricao.evento?.rede || 'Padrão'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <Badge status={inscricao.status} />
                  </td>

                  {/* Método */}
                  <td className="py-3.5 px-4 text-xs font-semibold text-[#52525B]">
                    {metodoFormatado}
                  </td>

                  {/* Saúde / Restrições */}
                  <td className="py-3.5 px-4">
                    {inscricao.observacoes_saude ? (
                      <span
                        title={inscricao.observacoes_saude}
                        className="text-xs text-[#0A0A0A] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FEE2E2] inline-block max-w-[150px] truncate"
                      >
                        ⚠️ {inscricao.observacoes_saude}
                      </span>
                    ) : (
                      <span className="text-xs text-[#A1A1AA]">—</span>
                    )}
                  </td>

                  {/* Data */}
                  <td className="py-3.5 px-4 text-xs text-[#71717A] tabular-nums whitespace-nowrap">
                    {formatarDataHora(inscricao.created_at)}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {podeConfirmarBaixa ? (
                        <>
                          {inscricao.status === 'pendente' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onAbrirBaixaManual(inscricao)}
                              aria-label={`Confirmar pagamento de ${inscricao.nome}`}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                              Confirmar
                            </Button>
                          )}

                          {inscricao.status !== 'pendente' && onReverterStatus && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onReverterStatus(inscricao.id)}
                              aria-label={`Reverter status de ${inscricao.nome}`}
                              title="Reverter para pendente"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-[#71717A]" aria-hidden="true" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-[#71717A] italic">
                          Apenas Secretaria
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
