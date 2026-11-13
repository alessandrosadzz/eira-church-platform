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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  titulo,
  subtitulo,
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

      // Foco automatico no primeiro elemento apos montagem e animacao de entrada GSAP
      setTimeout(() => {
        if (modalRef.current) {
          animateModalEntrance(modalRef.current);
          const firstInput = modalRef.current.querySelector<HTMLElement>('input, button:not([aria-label="Fechar"])');
          if (firstInput) firstInput.focus();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
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
        className={`relative w-full ${maxWidthStyles} bg-white rounded-xl shadow-2xl border border-[#E4E4E7] overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]`}
      >
        {/* Header do Modal */}
        {(titulo || subtitulo) && (
          <div className="flex items-start justify-between p-6 border-b border-[#E4E4E7] bg-white sticky top-0 z-10">
            <div className="space-y-1 pr-6">
              {titulo && (
                <h2 id="modal-title" className="text-xl font-bold tracking-tight text-[#0A0A0A]">
                  {titulo}
                </h2>
              )}
              {subtitulo && (
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {subtitulo}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-2 rounded-lg text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Conteudo com Scroll Interno */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
