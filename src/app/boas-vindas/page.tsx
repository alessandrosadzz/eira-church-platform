// src/app/boas-vindas/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../store/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  HeartHandshake,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function BoasVindasPage() {
  const { sucesso, erro } = useToast();
  const { igrejaConfig, adicionarVisitante } = useAdminStore();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bairro, setBairro] = useState('');
  const [quemConvidou, setQuemConvidou] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState<
    'Criança' | 'Adolescente (12-17)' | 'Jovem (18-29)' | 'Adulto' | 'Melhor Idade'
  >('Jovem (18-29)');
  const [querCelula, setQuerCelula] = useState(true);
  const [pedidoOracao, setPedidoOracao] = useState('');

  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      erro('Por favor, informe seu nome.');
      return;
    }

    if (!telefone.trim()) {
      erro('Informe seu WhatsApp para podermos te enviar uma mensagem de carinho.');
      return;
    }

    adicionarVisitante({
      nome: nome.trim(),
      telefone: telefone.trim(),
      bairro: bairro.trim() || 'Não informado',
      quem_convidou: quemConvidou.trim() || 'Culto de Domingo',
      faixa_etaria: faixaEtaria,
      quer_celula: querCelula,
      pedido_oracao: pedidoOracao.trim() || undefined,
      data_visita: new Date().toISOString().split('T')[0],
      status: 'novo',
      cadastrado_por: 'Auto-atendimento // Visitante',
    });

    sucesso('Seja muito bem-vindo(a) à nossa congregação!');
    setEnviadoComSucesso(true);
  };

  if (enviadoComSucesso) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto border-2 border-[#BBF7D0]">
            <HeartHandshake className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
              Que alegria ter você aqui, {nome.split(' ')[0]}!
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Você é muito especial para nós e para Deus. Nossa equipe de acolhimento vai entrar em contato com muito carinho para abençoar sua semana.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-left space-y-2">
            <div className="flex items-center space-x-2 text-[#0A0A0A] font-bold">
              <Sparkles className="w-4 h-4 text-[var(--accent,#EAB308)]" />
              <span>Nossos Próximos Cultos</span>
            </div>
            {igrejaConfig.cultos.slice(0, 2).map((c) => (
              <p key={c.id} className="text-[#52525B]">
                <strong className="text-black">{c.dia} às {c.horario}:</strong> {c.descricao}
              </p>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full py-3 rounded-lg text-xs font-bold bg-[#0A0A0A] text-white hover:bg-[#27272A] transition-colors block text-center"
            >
              Ver Próximos Eventos da Igreja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Topo com Logo e Boas-Vindas */}
      <header className="w-full bg-white border-b border-[#E4E4E7] py-4 px-4 sm:px-6">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#71717A] hover:text-[#0A0A0A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Início</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-[#0A0A0A]">{igrejaConfig.nome}</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
              Conexão
            </span>
          </div>
        </div>
      </header>

      {/* Formulário de Auto-Cadastro */}
      <main className="max-w-xl mx-auto w-full px-4 py-8 flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm space-y-5 text-left"
        >
          <div className="border-b border-[#E4E4E7] pb-4 space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase bg-[#F4F4F5] text-[#52525B]">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Acolhimento da Igreja</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              Seja Bem-vindo(a) à {igrejaConfig.nome}!
            </h1>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Queremos conhecer você melhor e orar pela sua vida. Preencha seus dados com tranquilidade:
            </p>
          </div>

          <Input
            label="Seu Nome Completo"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como você gostaria de ser chamado(a)?"
          />

          <Input
            label="Seu WhatsApp com DDD"
            required
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(45) 99881-2233"
            helperText="Usaremos para te enviar uma mensagem de boas-vindas."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bairro onde você mora"
              value={bairro}
              onChange={(e) => setNovoBairro => setBairro(e.target.value)}
              placeholder="Ex: Coqueiral, Centro, Neva..."
            />

            <Input
              label="Quem te convidou hoje?"
              value={quemConvidou}
              onChange={(e) => setQuemConvidou(e.target.value)}
              placeholder="Ex: Um amigo, Instagram, Família..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                Faixa Etária
              </label>
              <select
                value={faixaEtaria}
                onChange={(e) => setFaixaEtaria(e.target.value as any)}
                className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
              >
                <option value="Criança">Criança (Eira Kids)</option>
                <option value="Adolescente (12-17)">Adolescente (12-17 // Hype)</option>
                <option value="Jovem (18-29)">Jovem (18-29 // One Way)</option>
                <option value="Adulto">Adulto</option>
                <option value="Melhor Idade">Melhor Idade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                Gostaria de conhecer uma célula?
              </label>
              <button
                type="button"
                onClick={() => setQuerCelula(!querCelula)}
                className={`w-full h-12 px-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                  querCelula
                    ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                    : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]'
                }`}
              >
                <span>{querCelula ? '✓ Sim, adoraria conhecer!' : 'Agora não'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
              Pedido de Oração (Opcional e Confidencial)
            </label>
            <textarea
              rows={3}
              value={pedidoOracao}
              onChange={(e) => setPedidoOracao(e.target.value)}
              placeholder="Podemos orar por você ou por sua família nesta semana? Escreva aqui..."
              className="w-full p-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Enviar Meu Cadastro de Boas-Vindas
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
