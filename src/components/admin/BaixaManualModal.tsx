'use client';

// src/components/admin/BaixaManualModal.tsx

import React, { useState } from 'react';
import { Inscricao, MetodoPagamento } from '../../types/inscricao';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatarMoeda } from '../../lib/formatters';
import { CheckCircle2, Banknote, QrCode, CreditCard, Gift } from 'lucide-react';

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
