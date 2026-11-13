// src/app/cadastro-lider/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../store/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  Church,
  Home,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft,
  Users,
  ShieldCheck,
} from 'lucide-react';

export default function CadastroLiderPage() {
  const { sucesso, erro } = useToast();
  const { igrejaConfig, adicionarCelula } = useAdminStore();

  const [nomeLider, setNomeLider] = useState('');
  const [telefoneLider, setTelefoneLider] = useState('');
  const [emailLider, setEmailLider] = useState('');
  const [nomeCelula, setNomeCelula] = useState('');
  const [rede, setRede] = useState<'Hype' | 'One Way' | 'Família' | 'Casais' | 'Adultos'>('Hype');
  const [diaSemana, setDiaSemana] = useState('Quinta-feira');
  const [horario, setHorario] = useState('20h00');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [quantidadeMembros, setQuantidadeMembros] = useState(4);
  const [viceLider, setViceLider] = useState('');
  const [anfitriao, setAnfitriao] = useState('');

  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeLider.trim()) {
      erro('Informe seu nome completo.');
      return;
    }
    if (!telefoneLider.trim()) {
      erro('Informe seu WhatsApp para contato pastoral.');
      return;
    }
    if (!nomeCelula.trim()) {
      erro('Informe o nome da sua célula.');
      return;
    }

    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
      `${endereco || bairro}, Cascavel - PR`
    )}`;

    adicionarCelula({
      nome: nomeCelula.trim(),
      rede,
      lider_nome: nomeLider.trim(),
      lider_telefone: telefoneLider.trim(),
      vice_lider_nome: viceLider.trim() || undefined,
      anfitriao_nome: anfitriao.trim() || undefined,
      dia_semana: diaSemana,
      horario,
      bairro: bairro.trim() || 'Centro',
      endereco: endereco.trim() || `${bairro}, Cascavel - PR`,
      maps_url: mapsUrl,
      membros: [
        {
          id: `m-lider-${Date.now()}`,
          nome: nomeLider.trim(),
          telefone: telefoneLider.trim(),
          tempo_celula: '1 ano+',
          batizado: true,
          funcao: 'Líder',
        },
      ],
    });

    sucesso('Célula cadastrada na base oficial da igreja!');
    setCadastradoComSucesso(true);
  };

  if (cadastradoComSucesso) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto border-2 border-[#BBF7D0]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
              Célula Registrada com Sucesso!
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Olá, <strong className="text-black">{nomeLider}</strong>! Sua célula{' '}
              <strong className="text-black">"{nomeCelula}"</strong> foi incluída no mapa e na rede oficial de células da {igrejaConfig.nome}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-left space-y-1.5">
            <p className="text-[#52525B]">
              <strong className="text-black">Rede:</strong> {rede}
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Encontro:</strong> {diaSemana} às {horario}
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Bairro:</strong> {bairro}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full py-3 rounded-lg text-xs font-bold bg-[#0A0A0A] text-white hover:bg-[#27272A] transition-colors block text-center"
            >
              Voltar para a Página Inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Topbar Institucional */}
      <header className="w-full bg-white border-b border-[#E4E4E7] py-4 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#71717A] hover:text-[#0A0A0A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-[#0A0A0A]">{igrejaConfig.nome}</span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-[var(--accent,#FACC15)]">
              Rede de Células
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm space-y-6 text-left"
        >
          <div className="border-b border-[#E4E4E7] pb-4 space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase bg-[#F4F4F5] text-[#52525B]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Link Exclusivo de Líderes</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              Cadastro da sua Célula // {igrejaConfig.nome}
            </h1>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Preencha os dados da sua célula para mapeamento no Google Maps, apoio pastoral e encaminhamento de novos visitantes acolhidos.
            </p>
          </div>

          {/* Dados do Líder */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              1. Seus Dados como Líder
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Seu Nome Completo"
                  required
                  value={nomeLider}
                  onChange={(e) => setNomeLider(e.target.value)}
                  placeholder="Ex: Gabriel Silva"
                />
              </div>

              <Input
                label="Seu WhatsApp com DDD"
                required
                type="tel"
                value={telefoneLider}
                onChange={(e) => setTelefoneLider(e.target.value)}
                placeholder="(45) 99881-2233"
              />

              <Input
                label="Seu E-mail (Opcional)"
                type="email"
                value={emailLider}
                onChange={(e) => setEmailLider(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Dados da Célula */}
          <div className="space-y-4 pt-4 border-t border-[#E4E4E7]">
            <h2 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              2. Informações da Célula
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome da Célula"
                  required
                  value={nomeCelula}
                  onChange={(e) => setNomeCelula(e.target.value)}
                  placeholder="Ex: Célula Hype // Intensidade & Propósito"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Rede Ministerial
                </label>
                <select
                  value={rede}
                  onChange={(e) => setRede(e.target.value as any)}
                  className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
                >
                  <option value="Hype">Rede Hype (Teens)</option>
                  <option value="One Way">Rede One Way (Jovens & Universitários)</option>
                  <option value="Família">Rede da Família</option>
                  <option value="Casais">Rede de Casais</option>
                  <option value="Adultos">Rede de Adultos</option>
                </select>
              </div>

              <Input
                label="Bairro onde se reúnem"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Coqueiral"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Dia da Reunião
                </label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
                >
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Sexta-feira">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <Input
                label="Horário"
                required
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="20h00"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Endereço da Reunião (Rua, Número e Bairro)"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua Flamboyant, 450 - Coqueiral, Cascavel - PR"
                  helperText="Utilizado para gerar o link direto no Google Maps para os participantes."
                />
              </div>

              <Input
                label="Nome do Vice-Líder (Opcional)"
                value={viceLider}
                onChange={(e) => setViceLider(e.target.value)}
                placeholder="Ex: Larissa Moura"
              />

              <Input
                label="Nome do Anfitrião da Casa (Opcional)"
                value={anfitriao}
                onChange={(e) => setAnfitriao(e.target.value)}
                placeholder="Ex: Família Andrade"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-end">
            <Button type="submit" variant="primary" size="lg" fullWidth>
              Concluir Cadastro da Minha Célula
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
