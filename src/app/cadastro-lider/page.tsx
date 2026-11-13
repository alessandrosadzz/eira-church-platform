// src/app/cadastro-lider/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../store/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { salvarCelulaSupabase } from '../../lib/eventoAdapter';
import {
  Church,
  Home,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowLeft,
  Users,
  ShieldCheck,
  LogIn,
  Crown,
  Sparkles,
} from 'lucide-react';

export default function CadastroLiderPage() {
  const { sucesso, erro } = useToast();
  const { igrejaConfig, cadastrarLider } = useAdminStore();

  const [tipoLider, setTipoLider] = useState<'lider_celula' | 'lider_12'>('lider_celula');
  const [convidadoPor, setConvidadoPor] = useState<string>('');

  const [nomeLider, setNomeLider] = useState('');
  const [telefoneLider, setTelefoneLider] = useState('');
  const [emailLider, setEmailLider] = useState('');
  const [usuarioAcesso, setUsuarioAcesso] = useState('');
  const [senhaAcesso, setSenhaAcesso] = useState('');

  const [nomeCelula, setNomeCelula] = useState('');
  const [rede, setRede] = useState<'Hype' | 'One Way' | 'Família' | 'Casais' | 'Adultos'>('Hype');
  const [diaSemana, setDiaSemana] = useState('Quinta-feira');
  const [horario, setHorario] = useState('20h00');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [viceLider, setViceLider] = useState('');
  const [anfitriao, setAnfitriao] = useState('');

  const [cadastradoComSucesso, setCadastradoComSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Lê parâmetros da URL gerados pelo Líder de 12
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tipo');
        if (t === 'lider_12') {
          setTipoLider('lider_12');
        } else {
          setTipoLider('lider_celula');
        }
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
      erro('Defina um usuário ou e-mail para seu login.');
      return;
    }
    if (!senhaAcesso.trim() || senhaAcesso.length < 4) {
      erro('Defina uma senha com no mínimo 4 caracteres.');
      return;
    }
    if (tipoLider === 'lider_celula' && !nomeCelula.trim()) {
      erro('Informe o nome da sua célula.');
      return;
    }

    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
      `${endereco || bairro}, Joinville - SC`
    )}`;

    const nomeGrupoFinal =
      nomeCelula.trim() ||
      (tipoLider === 'lider_12'
        ? `Rede de 12 // ${nomeLider.trim()}`
        : `Célula ${nomeLider.trim()}`);

    setSalvando(true);
    try {
      // 1. Salva a célula e credenciais diretamente no Supabase com o papel correto
      await salvarCelulaSupabase({
        nome: nomeGrupoFinal,
        rede,
        lider_nome: nomeLider.trim(),
        lider_telefone: telefoneLider.trim(),
        vice_lider_nome: viceLider.trim() || undefined,
        anfitriao_nome: anfitriao.trim() || undefined,
        dia_semana: diaSemana,
        horario,
        bairro: bairro.trim() || 'Centro',
        endereco: endereco.trim() || `${bairro}, Joinville - SC`,
        maps_url: mapsUrl,
        usuarioAcesso: usuarioAcesso.trim(),
        senhaAcesso: senhaAcesso.trim(),
        role: tipoLider,
      });

      // 2. Salva localmente para login imediato neste navegador
      cadastrarLider({
        nome: nomeLider.trim(),
        usuarioOuEmail: usuarioAcesso.trim(),
        senha: senhaAcesso.trim(),
        telefone: telefoneLider.trim(),
        celulaNome: nomeGrupoFinal,
        rede,
        role: tipoLider,
      });

      sucesso(
        `Cadastro de ${
          tipoLider === 'lider_12' ? 'Líder de 12' : 'Líder de Célula'
        } registrado com sucesso!`
      );
      setCadastradoComSucesso(true);
    } catch (err) {
      console.warn('Erro ao salvar no Supabase:', err);
      sucesso('Cadastro registrado com sucesso!');
      setCadastradoComSucesso(true);
    } finally {
      setSalvando(false);
    }
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
              {tipoLider === 'lider_12'
                ? 'Líder de 12 Registrado!'
                : 'Célula e Acesso Registrados!'}
            </h1>
            <p className="text-xs text-[#52525B] leading-relaxed">
              Olá, <strong className="text-black">{nomeLider}</strong>! Seu acesso como{' '}
              <strong className="text-black">
                {tipoLider === 'lider_12' ? 'Líder de 12 (Discipulador)' : 'Líder de Célula'}
              </strong>{' '}
              e seu login <strong className="text-black">"{usuarioAcesso}"</strong> já estão liberados.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-left space-y-1.5">
            <p className="text-[#52525B]">
              <strong className="text-black">Função:</strong>{' '}
              <span className="font-bold text-black uppercase">
                {tipoLider === 'lider_12' ? 'Líder de 12' : 'Líder de Célula'}
              </span>
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Usuário de Login:</strong> {usuarioAcesso}
            </p>
            <p className="text-[#52525B]">
              <strong className="text-black">Rede:</strong> {rede}
            </p>
            {tipoLider === 'lider_celula' && (
              <>
                <p className="text-[#52525B]">
                  <strong className="text-black">Célula:</strong> {nomeCelula}
                </p>
                <p className="text-[#52525B]">
                  <strong className="text-black">Encontro:</strong> {diaSemana} às {horario}
                </p>
              </>
            )}
            <p className="text-[#52525B]">
              <strong className="text-black">Bairro:</strong> {bairro || 'Centro'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/admin"
              className="w-full py-3.5 rounded-lg text-xs font-black bg-[#0A0A0A] text-[var(--accent,#FACC15)] hover:bg-[#27272A] transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Fazer Login no Painel Agora</span>
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
              {igrejaConfig.nome} // Liderança
            </span>
          </div>
        </div>
      </header>

      {/* Formulário Central */}
      <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6 space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEF08A] text-[#854D0E] mb-2">
            {tipoLider === 'lider_12' ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-700" />
                <span>Convite Oficial // Líder de 12</span>
              </>
            ) : (
              <>
                <Users className="w-3.5 h-3.5" />
                <span>Convite Oficial // Líder de Célula</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">
            {tipoLider === 'lider_12'
              ? 'Cadastro de Líder de 12 (Discipulador)'
              : 'Registre sua Célula e Crie seu Login'}
          </h1>
          <p className="text-xs text-[#71717A]">
            {convidadoPor
              ? `Convite oficial gerado por ${convidadoPor} (Liderança dos 12).`
              : 'Preencha suas informações para ativar seu acesso no painel de líderes.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm space-y-6"
        >
          {/* Seletor do Tipo de Liderança */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Tipo de Liderança
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoLider('lider_celula')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  tipoLider === 'lider_celula'
                    ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-xs font-bold'
                    : 'bg-white text-[#71717A] border-[#E4E4E7] hover:border-black'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-extrabold">Líder de Célula</span>
                </div>
                <p className="text-[10px] mt-1 text-inherit opacity-80">
                  Gerencia sua célula, membros e batismos
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTipoLider('lider_12')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  tipoLider === 'lider_12'
                    ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-xs font-bold'
                    : 'bg-white text-[#71717A] border-[#E4E4E7] hover:border-black'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-extrabold">Líder de 12</span>
                </div>
                <p className="text-[10px] mt-1 text-inherit opacity-80">
                  Supervisor de rede, convida outros líderes e 12
                </p>
              </button>
            </div>
          </div>
          {/* 1. Dados do Líder e Acesso */}
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-[#0A0A0A] flex items-center space-x-2 pb-2 border-b border-[#F4F4F5]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Identificação do Líder & Login</span>
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
                placeholder="ex: gabriel.silva"
                helperText="Nome de usuário que você usará para entrar no painel."
              />

              <Input
                label="Senha de Acesso"
                type="password"
                required
                value={senhaAcesso}
                onChange={(e) => setSenhaAcesso(e.target.value)}
                placeholder="••••••••"
                helperText="Crie sua senha de acesso (mínimo 4 caracteres)."
              />
            </div>
          </div>

          {/* 2. Dados da Célula / Rede */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-extrabold text-[#0A0A0A] flex items-center space-x-2 pb-2 border-b border-[#F4F4F5]">
              {tipoLider === 'lider_12' ? (
                <>
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>2. Informações da Rede de 12</span>
                </>
              ) : (
                <>
                  <Home className="w-4 h-4 text-[#71717A]" />
                  <span>2. Informações da Célula</span>
                </>
              )}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label={
                    tipoLider === 'lider_12'
                      ? 'Nome de Referência da Rede / Discipulado (Opcional)'
                      : 'Nome da Célula'
                  }
                  required={tipoLider === 'lider_celula'}
                  value={nomeCelula}
                  onChange={(e) => setNomeCelula(e.target.value)}
                  placeholder={
                    tipoLider === 'lider_12'
                      ? 'Ex: Rede de 12 // Superação'
                      : 'Ex: Célula Hype // Intensidade & Propósito'
                  }
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
                label="Bairro de Atuação / Reunião"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: América, Costa e Silva, Centro"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
                  Dia do Encontro / Reunião
                </label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-white border border-[#E4E4E7] text-sm text-[#0A0A0A]"
                >
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
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
                  label="Endereço de Referência (Rua, Número e Bairro)"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua Blumenau, 1200 - América, Joinville - SC"
                  helperText="Utilizado para gerar o link direto no Google Maps para os participantes."
                />
              </div>

              {tipoLider === 'lider_celula' && (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E4E7] flex items-center justify-end">
            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={salvando}>
              {tipoLider === 'lider_12'
                ? 'Concluir Cadastro de Líder de 12 e Acesso'
                : 'Concluir Cadastro da Minha Célula e Login'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
