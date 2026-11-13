'use client';

// src/components/ui/Modal.tsx

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { animateModalEntrance } from '../../lib/animations';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo?: string;
  subtitulo?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  headerExtra,
  footer,
  maxWidth = 'md',
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }

        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Foco automático inteligente sem forçar scroll para baixo
      setTimeout(() => {
        if (modalRef.current) {
          animateModalEntrance(modalRef.current);
          const firstInput = modalRef.current.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
          );
          if (firstInput) {
            firstInput.focus();
          } else {
            // Garante que o scroll do modal inicie no topo
            const scrollArea = modalRef.current.querySelector('.overflow-y-auto');
            if (scrollArea) scrollArea.scrollTop = 0;
          }
        }
      }, 50);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titulo ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Janela do Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthStyles} bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] overflow-hidden z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh]`}
      >
        {/* Header do Modal */}
        {(titulo || subtitulo || headerExtra) && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E4E4E7] bg-white shrink-0 z-10">
            <div className="space-y-0.5 pr-4 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                {titulo && (
                  <h2 id="modal-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0A0A0A] truncate">
                    {titulo}
                  </h2>
                )}
                {headerExtra}
              </div>
              {subtitulo && (
                <p className="text-xs text-[#71717A] leading-relaxed truncate">
                  {subtitulo}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-2 rounded-lg text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Conteudo com Scroll Interno Único */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>

        {/* Rodapé Fixo */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-[#E4E4E7] bg-[#FAFAFA] shrink-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
