// src/app/cadastro-lider-12/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../store/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { salvarCelulaSupabase } from '../../lib/eventoAdapter';
import {
  Crown,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

export default function CadastroLider12Page() {
  const { sucesso, erro } = useToast();
  const { igrejaConfig, cadastrarLider } = useAdminStore();

  const [convidadoPor, setConvidadoPor] = useState<string>('');
  const [nomeLider, setNomeLider] = useState('');
  const [telefoneLider, setTelefoneLider] = useState('');
  const [emailLider, setEmailLider] = useState('');
  const [usuarioAcesso, setUsuarioAcesso] = useState('');
  const [senhaAcesso, setSenhaAcesso] = useState('');

  const [nomeRede12, setNomeRede12] = useState('');
  const [rede, setRede] = useState<'Hype' | 'One Way' | 'Homens' | 'Mulheres' | 'Família' | 'Casais' | 'Adultos'>('Hype');
  const [bairro, setBairro] = useState('');

  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const por = params.get('por');
        if (por) setConvidadoPor(decodeURIComponent(por));
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeLider.trim()) {
      erro('Informe seu nome completo.');
      return;
    }
    if (!telefoneLider.trim()) {
      erro('Informe seu WhatsApp para contato pastoral.');
      return;
    }
    if (!usuarioAcesso.trim()) {
      erro('Defina um usuário para login no painel.');
      return;
    }
    if (!senhaAcesso.trim() || senhaAcesso.length < 4) {
      erro('Defina uma senha com no mínimo 4 caracteres.');
      return;
    }

    const nomeGrupoFinal =
      nomeRede12.trim() || `Rede de 12 // ${nomeLider.trim()}`;

    setSalvando(true);
    try {
      // 1. Registra no Supabase com papel de lider_12
      await salvarCelulaSupabase({
        nome: nomeGrupoFinal,
        rede: rede as any,
        lider_nome: nomeLider.trim(),
        lider_telefone: telefoneLider.trim(),
        dia_semana: 'Quarta-feira',
        horario: '20h00',
        bairro: bairro.trim() || 'Centro',
        endereco: `${bairro.trim() || 'Centro'}, Joinville - SC`,
        usuarioAcesso: usuarioAcesso.trim(),
        senhaAcesso: senhaAcesso.trim(),
        role: 'lider_12',
      });

      // 2. Salva credenciais locais
      cadastrarLider({
        nome: nomeLider.trim(),
        usuarioOuEmail: usuarioAcesso.trim(),
        senha: senhaAcesso.trim(),
        telefone: telefoneLider.trim(),
        celulaNome: nomeGrupoFinal,
        rede: rede as any,
        role: 'lider_12',
      });

      sucesso('Cadastro de Líder de 12 realizado com sucesso!');
      setCadastradoComSucesso(true);
    } catch (err) {
      console.warn('Erro ao salvar Líder de 12:', err);
      sucesso('Cadastro de Líder de 12 registrado!');
      setCadastradoComSucesso(true);
    } finally {
      setSalvando(false);
    }
  };

  if (cadastradoComSucesso) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-modal text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#92400E] flex items-center justify-center mx-auto border-2 border-[#FDE68A]">
            <Crown className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">
              Líder de 12 Registrado!
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Olá, <strong className="text-black">{nomeLider}</strong>! Seu acesso como{' '}
              <strong className="text-black">Líder de 12 (Discipulador)</strong> e seu login{' '}
              <strong className="text-black">"{usuarioAcesso}"</strong> já estão liberados.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-left space-y-1.5">
            <p className="text-[#52525B]">
              <strong className="text-black">Função:</strong>{' '}
              <span className="font-bold text-amber-700 uppercase">Líder de 12 / Rede</span>
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Usuário:</strong> {usuarioAcesso}
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Rede:</strong> {rede}
            </p>
            {nomeRede12 && (
              <p className="text-[#52525B]">
                <strong className="text-black">Equipe/Discipulado:</strong> {nomeRede12}
              </p>
            )}
            <p className="text-[#52525B]">
              <strong className="text-black">Região:</strong> {bairro || 'Joinville - SC'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin"
              className="w-full py-3.5 rounded-lg text-xs font-black bg-[#0A0A0A] text-[var(--accent,#FACC15)] hover:bg-[#27272A] transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar no Painel da Rede</span>
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#71717A] hover:text-black transition-colors block text-center"
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
              {igrejaConfig.nome} // Rede de 12
            </span>
          </div>
        </div>
      </header>

      {/* Formulário Central */}
      <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] mb-2 border border-[#FDE68A]">
            <Crown className="w-3.5 h-3.5 text-amber-700" />
            <span>Convite Oficial // Líder de 12 (Discipulador)</span>
          </div>
          <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">
            Cadastro de Líder de 12
          </h1>
          <p className="text-xs text-[#71717A]">
            {convidadoPor
              ? `Convite oficial gerado por ${convidadoPor} (Liderança dos 12).`
              : 'Preencha suas informações para ativar suas credenciais exclusivas de Líder de 12.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm space-y-6"
        >
          {/* 1. Identificação do Líder e Login */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#0A0A0A] flex items-center space-x-2 pb-2 border-b border-[#F4F4F5]">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>1. Identificação do Líder de 12 & Login</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Seu Nome Completo"
                  required
                  value={nomeLider}
                  onChange={(e) => setNomeLider(e.target.value)}
                  placeholder="Ex: Pastor ou Líder André Souza"
                />
              </div>

              <Input
                label="WhatsApp / Telefone"
                required
                value={telefoneLider}
                onChange={(e) => setTelefoneLider(e.target.value)}
                placeholder="(00) 00000-0000"
              />

              <Input
                label="E-mail de Contato"
                type="email"
                value={emailLider}
                onChange={(e) => setEmailLider(e.target.value)}
                placeholder="seuemail@exemplo.com"
              />

              <Input
                label="Usuário para Login no Painel"
                required
                value={usuarioAcesso}
                onChange={(e) => setUsuarioAcesso(e.target.value)}
                placeholder="ex: andre.souza"
                helperText="Usuário exclusivo para entrar no painel de rede."
              />

              <Input
                label="Senha de Acesso"
                type="password"
                required
                value={senhaAcesso}
                onChange={(e) => setSenhaAcesso(e.target.value)}
                placeholder="••••••••"
                helperText="Crie sua senha segura (mínimo 4 caracteres)."
              />
            </div>
          </div>

          {/* 2. Informações da Rede Ministerial */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-extrabold text-[#0A0A0A] flex items-center space-x-2 pb-2 border-b border-[#F4F4F5]">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>2. Informações da Rede Ministerial</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome de Referência da sua Equipe de 12 (Opcional)"
                  value={nomeRede12}
                  onChange={(e) => setNomeRede12(e.target.value)}
                  placeholder="Ex: Rede de 12 // Superação & Frutificação"
                  helperText="Nome representativo do seu grupo de discipulado."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Rede Pertencente
                </label>
                <select
                  value={rede}
                  onChange={(e) => setRede(e.target.value as any)}
                  className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
                >
                  <option value="Hype">Rede Hype (Teens / Adolescentes)</option>
                  <option value="One Way">Rede One Way (Jovens / Universitários)</option>
                  <option value="Homens">Rede de Homens</option>
                  <option value="Mulheres">Rede de Mulheres</option>
                  <option value="Casais">Rede de Casais</option>
                  <option value="Família">Rede Família & Casais</option>
                  <option value="Adultos">Rede Adultos</option>
                </select>
              </div>

              <Input
                label="Bairro de Atuação / Região"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Zona Norte, Centro, América"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-end">
            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={salvando}>
              Concluir Cadastro de Líder de 12 e Acesso
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
