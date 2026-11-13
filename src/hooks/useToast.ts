// src/hooks/useToast.ts

import { create } from 'zustand';

export type ToastTipo = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  tipo: ToastTipo;
  mensagem: string;
  detalhe?: string;
  duracao?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }], // Mantem no maximo 3 toasts
    }));

    const tempo = toast.duracao || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, tempo);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const { addToast, removeToast } = useToastStore();
  return {
    toast: addToast,
    dismiss: removeToast,
    sucesso: (mensagem: string, detalhe?: string) => addToast({ tipo: 'success', mensagem, detalhe }),
    erro: (mensagem: string, detalhe?: string) => addToast({ tipo: 'error', mensagem, detalhe }),
    info: (mensagem: string, detalhe?: string) => addToast({ tipo: 'info', mensagem, detalhe }),
  };
}
