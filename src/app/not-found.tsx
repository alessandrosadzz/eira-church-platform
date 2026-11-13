// src/app/not-found.tsx
import Link from 'next/link';
import { Church, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center border-2 border-[#FEF08A]">
        <Church className="w-8 h-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0A0A]">
        Página Não Encontrada (404)
      </h1>
      <p className="text-sm text-[#71717A] max-w-sm">
        O endereço que você tentou acessar não existe ou o evento foi realocado.
      </p>
      <Link
        href="/"
        className="inline-flex items-center space-x-2 px-5 py-3 rounded-[var(--radius-btn,0.5rem)] bg-black text-[var(--accent,#FACC15)] font-bold text-xs shadow-sm hover:bg-[#27272A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retornar para a Página Inicial</span>
      </Link>
    </div>
  );
}
