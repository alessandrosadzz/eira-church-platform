'use client';

// src/components/admin/DataTable.tsx

import React, { useState } from 'react';
import { Inscricao, MetodoPagamento } from '../../types/inscricao';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatarDataHora, formatarMoeda } from '../../lib/formatters';
import {
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Lock,
  Paperclip,
  ExternalLink,
  ShieldAlert,
  MessageCircle,
  Eye,
} from 'lucide-react';

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
  const [comprovanteVisualizar, setComprovanteVisualizar] = useState<{ url: string; nome: string } | null>(null);
  const [participanteDetalhes, setParticipanteDetalhes] = useState<Inscricao | null>(null);
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
                    <div className="font-bold text-[#0A0A0A] flex items-center gap-1.5">
                      <span>{inscricao.nome}</span>
                      {inscricao.idade ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B]">
                          {inscricao.idade}a
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-[#71717A]">
                      {inscricao.telefone || inscricao.email || 'Sem contato'}
                    </div>

                    <button
                      type="button"
                      onClick={() => setParticipanteDetalhes(inscricao)}
                      className="text-[11px] font-bold text-[#71717A] hover:text-black flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                      title="Ver ficha detalhada do participante"
                    >
                      <Eye className="w-3 h-3 text-[#A1A1AA]" />
                      <span>Ver ficha completa</span>
                    </button>

                    {/* WhatsApp e Email do Responsável (quando informado / menor) */}
                    {inscricao.telefone_responsavel && (
                      <div className="mt-1 pt-1 border-t border-[#F4F4F5] text-[11px] text-[#1E40AF] space-y-0.5">
                        <div className="flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-[#2563EB] shrink-0" />
                          <span>Resp: {inscricao.telefone_responsavel}</span>
                          <a
                            href={`https://wa.me/55${inscricao.telefone_responsavel.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#166534] hover:underline font-bold inline-flex items-center gap-0.5 ml-1"
                            title="Chamar responsável no WhatsApp"
                          >
                            <MessageCircle className="w-2.5 h-2.5 text-[#22C55E]" />
                            WhatsApp
                          </a>
                        </div>
                        {inscricao.email_responsavel && (
                          <div className="text-[10px] text-[#3B82F6] font-mono truncate max-w-[220px]">
                            {inscricao.email_responsavel}
                          </div>
                        )}
                      </div>
                    )}
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
                    <div>{metodoFormatado}</div>
                    {inscricao.comprovante_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setComprovanteVisualizar({
                            url: inscricao.comprovante_url!,
                            nome: inscricao.nome,
                          })
                        }
                        className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0] transition-colors cursor-pointer"
                        title="Visualizar print do comprovante"
                      >
                        <Paperclip className="w-3 h-3 mr-0.5" />
                        Comprovante
                      </button>
                    )}
                  </td>

                  {/* Saúde / Restrições */}
                  <td className="py-3.5 px-4">
                    {inscricao.observacoes_saude ? (
                      <button
                        type="button"
                        onClick={() => setParticipanteDetalhes(inscricao)}
                        title="Clique para ver os detalhes médicos completos"
                        className="text-xs text-[#991B1B] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-2 py-1 rounded border border-[#FECACA] inline-flex items-center gap-1 max-w-[170px] truncate text-left font-semibold transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                        <span className="truncate">{inscricao.observacoes_saude}</span>
                      </button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setParticipanteDetalhes(inscricao)}
                        title="Ver todos os detalhes da inscrição"
                        aria-label={`Ver detalhes de ${inscricao.nome}`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0A0A0A]" />
                      </Button>

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

      {/* Modal de Visualização Rápida de Comprovante */}
      {comprovanteVisualizar && (
        <Modal
          isOpen={true}
          onClose={() => setComprovanteVisualizar(null)}
          titulo="Comprovante de Pagamento"
          subtitulo={`Participante: ${comprovanteVisualizar.nome}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-center">
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#E4E4E7] bg-[#0A0A0A] p-2 flex items-center justify-center">
              <img
                src={comprovanteVisualizar.url}
                alt={`Comprovante de ${comprovanteVisualizar.nome}`}
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={comprovanteVisualizar.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-black hover:text-[var(--accent-hover,#CA8A04)] inline-flex items-center"
              >
                <span>Abrir imagem em nova aba</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setComprovanteVisualizar(null)}
              >
                Fechar Visualizador
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Ficha Completa do Participante */}
      {participanteDetalhes && (
        <Modal
          isOpen={true}
          onClose={() => setParticipanteDetalhes(null)}
          titulo={participanteDetalhes.nome}
          headerExtra={
            <div className="flex items-center space-x-2">
              {participanteDetalhes.idade && (
                <span className="px-2 py-0.5 rounded text-xs font-black bg-black text-[var(--accent,#FACC15)]">
                  {participanteDetalhes.idade} ANOS
                </span>
              )}
              <Badge status={participanteDetalhes.status} />
            </div>
          }
          subtitulo={`${participanteDetalhes.rede_participante ? 'Rede ' + participanteDetalhes.rede_participante : 'Rede Geral'} • Inscrição: ${participanteDetalhes.comprovante_hash || participanteDetalhes.id.slice(0, 8)} • Inscrito em ${formatarDataHora(participanteDetalhes.created_at)}`}
          maxWidth="lg"
          footer={
            <div className="w-full flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                {participanteDetalhes.telefone && (
                  <a
                    href={`https://wa.me/55${participanteDetalhes.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá ${participanteDetalhes.nome.split(' ')[0]}! Aqui é da equipe da Eira Church sobre sua inscrição no ${participanteDetalhes.evento?.nome || 'evento'}!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#22C55E] text-white hover:bg-[#16A34A] inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp do Participante</span>
                  </a>
                )}

                {participanteDetalhes.status === 'pendente' && podeConfirmarBaixa && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const p = participanteDetalhes;
                      setParticipanteDetalhes(null);
                      onAbrirBaixaManual(p);
                    }}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Confirmar Pagamento</span>
                  </Button>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setParticipanteDetalhes(null)}
              >
                Fechar
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-left text-sm">
            {/* SEÇÃO NOBRE: OBSERVAÇÕES DE SAÚDE, ALERGIAS E REMÉDIOS */}
            <div className={`p-4 rounded-xl border ${
              participanteDetalhes.observacoes_saude
                ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                : 'bg-[#F4F4F5] border-[#E4E4E7]'
            }`}>
              <div className="flex items-center space-x-2 mb-1.5">
                <AlertTriangle className={`w-4 h-4 ${
                  participanteDetalhes.observacoes_saude ? 'text-[#DC2626]' : 'text-[#71717A]'
                }`} />
                <span className={`text-xs font-black uppercase tracking-wider ${
                  participanteDetalhes.observacoes_saude ? 'text-[#991B1B]' : 'text-[#52525B]'
                }`}>
                  Observações Médicas, Alergias & Remédios
                </span>
              </div>
              {participanteDetalhes.observacoes_saude ? (
                <p className="text-sm font-bold text-[#7F1D1D] bg-white p-3 rounded-lg border border-[#FECACA] leading-relaxed">
                  {participanteDetalhes.observacoes_saude}
                </p>
              ) : (
                <p className="text-xs text-[#71717A] italic">
                  Nenhuma observação médica, alergia ou medicação informada pelo participante.
                </p>
              )}
            </div>

            {/* GRID DE INFORMAÇÕES PESSOAIS E DE CONTATO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Contato do Participante */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">
                  Contato do Participante
                </span>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">WhatsApp:</span>
                    <div className="flex items-center space-x-1.5">
                      <strong className="text-[#0A0A0A]">{participanteDetalhes.telefone || 'Não informado'}</strong>
                      {participanteDetalhes.telefone && (
                        <a
                          href={`https://wa.me/55${participanteDetalhes.telefone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0] inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-[#16a34a]" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">E-mail:</span>
                    <strong className="text-[#0A0A0A] truncate max-w-[170px]" title={participanteDetalhes.email || ''}>
                      {participanteDetalhes.email || 'Não informado'}
                    </strong>
                  </div>

                  {participanteDetalhes.nascimento && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A]">Nascimento:</span>
                      <strong className="text-[#0A0A0A]">{participanteDetalhes.nascimento}</strong>
                    </div>
                  )}

                  {participanteDetalhes.endereco && (
                    <div className="flex items-start justify-between pt-1 border-t border-[#F4F4F5]">
                      <span className="text-[#71717A]">Endereço:</span>
                      <strong className="text-[#0A0A0A] text-right max-w-[180px]">{participanteDetalhes.endereco}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Célula e Igreja */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">
                  Célula & Vida na Igreja
                </span>
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Você já participa de célula?</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      participanteDetalhes.participa_celula
                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                        : 'bg-[#F4F4F5] text-[#71717A]'
                    }`}>
                      {participanteDetalhes.participa_celula ? 'Sim, já participo' : 'Ainda não'}
                    </span>
                  </div>

                  {participanteDetalhes.nome_celula_lider && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A]">Célula / Líder:</span>
                      <strong className="text-[#0A0A0A]">{participanteDetalhes.nome_celula_lider}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Rede:</span>
                    <strong className="text-[#0A0A0A]">{participanteDetalhes.rede_participante || 'Geral'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO DO RESPONSÁVEL (QUANDO INFORMADO) */}
            {(participanteDetalhes.nome_responsavel || participanteDetalhes.telefone_responsavel) && (
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-black uppercase text-[#1E40AF]">
                    Dados do Responsável Legal (Menor de Idade / Hype)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Nome:</span>
                    <strong className="text-[#0A0A0A]">{participanteDetalhes.nome_responsavel || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[11px]">WhatsApp / Tel:</span>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <strong className="text-[#0A0A0A]">{participanteDetalhes.telefone_responsavel}</strong>
                      {participanteDetalhes.telefone_responsavel && (
                        <a
                          href={`https://wa.me/55${participanteDetalhes.telefone_responsavel.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0]"
                        >
                          Chamar
                        </a>
                      )}
                    </div>
                  </div>
                  {participanteDetalhes.email_responsavel && (
                    <div>
                      <span className="text-[#64748B] block text-[11px]">E-mail:</span>
                      <strong className="text-[#0A0A0A] truncate block max-w-[180px]">{participanteDetalhes.email_responsavel}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DADOS DO EVENTO E PAGAMENTO */}
            <div className="p-4 rounded-xl bg-white border border-[#E4E4E7] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#71717A] block">
                Dados do Evento & Pagamento
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[#71717A] block text-[11px]">Evento:</span>
                  <strong className="text-[#0A0A0A]">{participanteDetalhes.evento?.nome || 'Evento Geral'}</strong>
                </div>
                <div>
                  <span className="text-[#71717A] block text-[11px]">Valor:</span>
                  <strong className="text-[#0A0A0A]">{formatarMoeda(participanteDetalhes.evento?.valor || 0)}</strong>
                </div>
                <div>
                  <span className="text-[#71717A] block text-[11px]">Forma Escolhida:</span>
                  <strong className="text-[#0A0A0A] uppercase">{participanteDetalhes.metodo_pag || 'Não informado'}</strong>
                </div>
                <div>
                  <span className="text-[#71717A] block text-[11px]">Código Inscrição:</span>
                  <strong className="text-[#0A0A0A] font-mono">{participanteDetalhes.comprovante_hash || participanteDetalhes.id.slice(0, 8)}</strong>
                </div>
              </div>

              {participanteDetalhes.comprovante_url && (
                <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between">
                  <span className="text-xs text-[#52525B]">Comprovante anexado pelo participante:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setComprovanteVisualizar({
                        url: participanteDetalhes.comprovante_url!,
                        nome: participanteDetalhes.nome,
                      });
                    }}
                    className="px-2.5 py-1 rounded text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] hover:bg-[#BBF7D0] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Ver Comprovante</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
