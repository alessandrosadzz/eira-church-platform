// src/components/form/InscricaoModal.tsx

import React from 'react';
import { Evento } from '../../types/evento';
import { Modal } from '../ui/Modal';
import { InscricaoForm } from './InscricaoForm';

export interface InscricaoModalProps {
  evento: Evento | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InscricaoModal: React.FC<InscricaoModalProps> = ({
  evento,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!evento) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo={evento.nome}
      subtitulo={`Inscrição oficial — Eira Church // Rede ${evento.rede}`}
      maxWidth="md"
    >
      <InscricaoForm
        evento={evento}
        onCancel={onClose}
        onSuccess={() => {
          if (onSuccess) onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
};

export default InscricaoModal;
