'use client';

// src/components/ui/Toast.tsx

import React from 'react';
import { useToastStore, ToastItem } from '../../hooks/useToast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificações do sistema"
      className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <ToastSingle key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastSingle: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const isError = toast.tipo === 'error';

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-[#166534] shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="w-5 h-5 text-[#991B1B] shrink-0" aria-hidden="true" />,
    info: <Info className="w-5 h-5 text-[#075985] shrink-0" aria-hidden="true" />,
  }[toast.tipo];

  const styleMap = {
    success: 'bg-[#DCFCE7] border-[#BBF7D0] text-[#14532D]',
    error: 'bg-[#FEE2E2] border-[#FCA5A5] text-[#7F1D1D]',
    info: 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0C4A6E]',
  }[toast.tipo];

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-200 animate-slideIn ${styleMap}`}
    >
      <div className="pt-0.5">{iconMap}</div>
      <div className="flex-1 space-y-0.5 text-left">
        <p className="text-sm font-bold tracking-tight">{toast.mensagem}</p>
        {toast.detalhe && <p className="text-xs opacity-90">{toast.detalhe}</p>}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className="text-current opacity-60 hover:opacity-100 p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
