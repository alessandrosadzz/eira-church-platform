// src/app/cadastro-lider/page.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '../../store/adminStore';
import { Home, ArrowLeft, Crown, ArrowRight } from 'lucide-react';

export default function CadastroLiderHubPage() {
  const router = useRouter();
  const { igrejaConfig } = useAdminStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tipo = params.get('tipo');
        const por = params.get('por');
        const paramPor = por ? `?por=${encodeURIComponent(por)}` : '';

        if (tipo === 'lider_12' || tipo === 'lider12' || tipo === 'rede') {
          router.replace(`/cadastro-lider-12${paramPor}`);
        } else if (tipo === 'lider_celula' || tipo === 'celula') {
          router.replace(`/cadastro-lider-celula${paramPor}`);
        }
      } catch {}
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="w-full bg-white border-b border-[#E4E4E7] py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#71717A] hover:text-[#0A0A0A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Página Inicial</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#0A0A0A] text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-xs overflow-hidden">
              {igrejaConfig?.logoUrl ? (
                <img
                  src={igrejaConfig.logoUrl}
                  alt={igrejaConfig.nome}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                igrejaConfig.nome.charAt(0)
              )}
            </div>
            <span className="text-xs font-bold text-[#0A0A0A]">
              {igrejaConfig.nome} // Liderança
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 w-full flex-1 flex flex-col justify-center">
        <div className="text-center space-y-2 mb-8">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
            Portal de Ativação Ministerial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
            Escolha seu Cadastro de Liderança
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] max-w-md mx-auto">
            Os links oficiais de ativação são separados por função para garantir seu acesso correto ao painel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Líder de Célula */}
          <Link
            href="/cadastro-lider-celula"
            className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm hover:border-black hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center border border-[#BBF7D0]">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#166534]">
                  Liderança Local
                </span>
                <h2 className="text-lg font-black text-[#0A0A0A] group-hover:text-black">
                  Líder de Célula
                </h2>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Cadastre sua célula, dia de encontro, endereço, membros e tenha seu painel de acompanhamento.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between text-xs font-bold text-black">
              <span>Acessar Cadastro de Célula</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Líder de 12 */}
          <Link
            href="/cadastro-lider-12"
            className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm hover:border-black hover:shadow-md transition-all text-left flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center border border-[#FDE68A]">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#92400E]">
                  Supervisor / Discipulador
                </span>
                <h2 className="text-lg font-black text-[#0A0A0A] group-hover:text-black">
                  Líder de 12
                </h2>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Ative suas credenciais exclusivas para supervisão da sua rede, eventos e geração de novos convites.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between text-xs font-bold text-black">
              <span>Acessar Cadastro de 12</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
