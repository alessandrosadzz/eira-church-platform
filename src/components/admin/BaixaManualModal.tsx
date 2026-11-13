'use client';

// src/components/admin/BaixaManualModal.tsx

import React, { useState } from 'react';
import { Inscricao, MetodoPagamento } from '../../types/inscricao';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatarMoeda } from '../../lib/formatters';
import {
  CheckCircle2,
  Banknote,
  QrCode,
  CreditCard,
  Gift,
  ExternalLink,
  Paperclip,
  ShieldAlert,
  MessageCircle,
} from 'lucide-react';

export interface BaixaManualModalProps {
  inscricao: Inscricao | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (inscricaoId: string, metodo: MetodoPagamento, novoStatus: 'pago' | 'isento') => Promise<void>;
}

export const BaixaManualModal: React.FC<BaixaManualModalProps> = ({
  inscricao,
  isOpen,
  onClose,
  onConfirmar,
}) => {
  const [metodo, setMetodo] = useState<MetodoPagamento>('dinheiro');
  const [tipoBaixa, setTipoBaixa] = useState<'pago' | 'isento'>('pago');
  const [isLoading, setIsLoading] = useState(false);

  if (!inscricao) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onConfirmar(inscricao.id, tipoBaixa === 'isento' ? 'isento' : metodo, tipoBaixa);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo="Confirmar Pagamento / Baixa Manual"
      subtitulo={`Participante: ${inscricao.nome} — Evento: ${inscricao.evento?.nome || ''}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Detalhes do Valor */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-xs text-[#71717A] uppercase font-bold">Valor do Evento</span>
          <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
            {formatarMoeda(inscricao.evento?.valor || 0)}
          </p>
        </div>

        {/* Contato do Responsável (quando adolescente / informado) */}
        {inscricao.telefone_responsavel && (
          <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2 text-xs text-[#1E40AF]">
            <div className="flex items-center justify-between">
              <span className="font-extrabold flex items-center gap-1.5 text-[#1E40AF]">
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                Contato do Responsável (Menor / HYPE)
              </span>
              <a
                href={`https://wa.me/55${inscricao.telefone_responsavel.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] font-bold text-[11px] hover:underline inline-flex items-center gap-1"
                title="Chamar responsável no WhatsApp"
              >
                <MessageCircle className="w-3 h-3 text-[#22C55E]" />
                WhatsApp do Pai/Mãe
              </a>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <p><strong>WhatsApp:</strong> {inscricao.telefone_responsavel}</p>
              {inscricao.email_responsavel && (
                <p><strong>E-mail:</strong> {inscricao.email_responsavel}</p>
              )}
              {inscricao.nome_responsavel && (
                <p><strong>Nome:</strong> {inscricao.nome_responsavel}</p>
              )}
            </div>
          </div>
        )}

        {/* Comprovante Anexado pelo Participante */}
        {inscricao.comprovante_url && (
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166534] flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#16a34a]" />
                Comprovante Enviado pelo Participante
              </span>
              <a
                href={inscricao.comprovante_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#15803D] hover:underline flex items-center"
              >
                <span>Abrir Completo</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="max-h-52 overflow-hidden rounded-lg border border-[#86EFAC] bg-white flex items-center justify-center p-1">
              <img
                src={inscricao.comprovante_url}
                alt="Comprovante de pagamento"
                className="max-h-48 w-auto object-contain rounded cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => {
                  window.open(inscricao.comprovante_url || '', '_blank');
                }}
              />
            </div>
            <p className="text-[10px] text-[#15803D] text-center italic">
              Dica: Clique no comprovante para ampliar e conferir os dados bancários antes de dar baixa.
            </p>
          </div>
        )}

        {/* Escolha: Pagamento ou Isenção */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
            Tipo de Baixa
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoBaixa('pago')}
              className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                tipoBaixa === 'pago'
                  ? 'border-black bg-black text-[var(--accent,#FACC15)]'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Recebimento</span>
            </button>

            <button
              type="button"
              onClick={() => setTipoBaixa('isento')}
              className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                tipoBaixa === 'isento'
                  ? 'border-black bg-black text-[var(--accent,#FACC15)]'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Conceder Isenção</span>
            </button>
          </div>
        </div>

        {/* Se for pagamento: escolher o meio de recebimento */}
        {tipoBaixa === 'pago' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Meio de Recebimento Físico / Bancário
            </label>
            <div className="space-y-2">
              {[
                { id: 'dinheiro' as MetodoPagamento, label: 'Dinheiro em Espécie (Secretaria)', icon: Banknote },
                { id: 'pix' as MetodoPagamento, label: 'Pix Direto (Chave da Igreja)', icon: QrCode },
                { id: 'cartao' as MetodoPagamento, label: 'Cartão Presencial (Máquina Balcão)', icon: CreditCard },
              ].map((opcao) => {
                const Icon = opcao.icon;
                const isSelected = metodo === opcao.id;
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => setMetodo(opcao.id)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center space-x-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-black bg-[#FEF9C3] text-black font-bold ring-1 ring-black'
                        : 'border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#F4F4F5]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#0A0A0A]" />
                    <span className="text-xs">{opcao.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Botoes de Acao */}
        <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#E4E4E7]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Confirmar Baixa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
