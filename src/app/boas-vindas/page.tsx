// src/app/boas-vindas/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
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
  ExternalLink,
  Home,
} from 'lucide-react';

export default function BoasVindasPage() {
  const { sucesso, erro } = useToast();
  const { igrejaConfig, adicionarVisitante, celulas } = useAdminStore();

  const [nome, setNome] = useState('');
  const [sexo, setSexo] = useState<'Homem' | 'Mulher'>('Homem');
  const [cultoOrigem, setCultoOrigem] = useState<
    'Culto de Domingo (Adultos/Família)' | 'One Way (Jovens)' | 'Hype (Teens)' | 'Outro'
  >('Culto de Domingo (Adultos/Família)');
  const [telefone, setTelefone] = useState('');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [quemConvidou, setQuemConvidou] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState<
    'Criança' | 'Adolescente (12-17)' | 'Jovem (18-29)' | 'Adulto' | 'Melhor Idade'
  >('Jovem (18-29)');
  const [jaParticipaCelula, setJaParticipaCelula] = useState(false);
  const [nomeCelulaAtual, setNomeCelulaAtual] = useState('');
  const [querCelula, setQuerCelula] = useState(true);
  const [pedidoOracao, setPedidoOracao] = useState('');

  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);

  // Link do Google Maps gerado em tempo real
  const mapsLink = useMemo(() => {
    const local = endereco.trim() || bairro.trim();
    if (!local) return '';
    return `https://maps.google.com/?q=${encodeURIComponent(`${local}, Cascavel - PR`)}`;
  }, [endereco, bairro]);

  // Célula mais próxima identificada por bairro
  const celulaProxima = useMemo(() => {
    if (!bairro.trim() && !endereco.trim()) return null;
    const termo = (bairro.trim() || endereco.trim()).toLowerCase();
    return celulas.find(
      (c) =>
        c.bairro.toLowerCase().includes(termo) ||
        c.endereco.toLowerCase().includes(termo)
    );
  }, [bairro, endereco, celulas]);

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
      sexo,
      culto_origem: cultoOrigem,
      telefone: telefone.trim(),
      bairro: bairro.trim() || 'Não informado',
      endereco: endereco.trim() || undefined,
      maps_url: mapsLink || undefined,
      quem_convidou: quemConvidou.trim() || 'Culto da Igreja',
      faixa_etaria: faixaEtaria,
      ja_participa_celula: jaParticipaCelula,
      nome_celula_atual: jaParticipaCelula ? nomeCelulaAtual.trim() : undefined,
      quer_celula: jaParticipaCelula ? false : querCelula,
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

          {celulaProxima && (
            <div className="p-4 rounded-xl bg-[#FEF08A]/30 border border-[#FDE047] text-xs text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-[#854D0E] font-bold">
                <Home className="w-4 h-4 text-[#854D0E]" />
                <span>Célula Pertinho de Você no {celulaProxima.bairro}!</span>
              </div>
              <p className="text-[#713F12]">
                <strong>{celulaProxima.nome}</strong> ({celulaProxima.dia_semana} às {celulaProxima.horario})
              </p>
              <p className="text-[11px] text-[#854D0E]">
                Líder responsável: {celulaProxima.lider_nome}
              </p>
            </div>
          )}

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
            <div className="w-6 h-6 rounded bg-black text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-xs">
              {igrejaConfig.nome.charAt(0)}
            </div>
            <span className="text-xs font-extrabold text-[#0A0A0A]">
              {igrejaConfig.nome}
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

          {/* Seleção Homem / Mulher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
              Gênero
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSexo('Homem')}
                className={`h-12 rounded-lg border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  sexo === 'Homem'
                    ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm'
                    : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                }`}
              >
                <span>👨 Sou Homem</span>
              </button>
              <button
                type="button"
                onClick={() => setSexo('Mulher')}
                className={`h-12 rounded-lg border text-xs font-extrabold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  sexo === 'Mulher'
                    ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm'
                    : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                }`}
              >
                <span>👩 Sou Mulher</span>
              </button>
            </div>
          </div>

          {/* De qual Culto você participou hoje? */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              De qual culto você participou hoje?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'Culto de Domingo (Adultos/Família)', label: '🏛️ Culto de Domingo (Família)', desc: 'Celebração de Domingo' },
                { id: 'One Way (Jovens)', label: '🔥 One Way (Jovens)', desc: 'Culto de Sábado 19h30' },
                { id: 'Hype (Teens)', label: '⚡ Hype (Adolescentes)', desc: 'Rede de Teens' },
                { id: 'Outro', label: '✨ Outro Encontro / Evento', desc: 'Culto Especial ou Retiro' },
              ].map((c) => {
                const ativo = cultoOrigem === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCultoOrigem(c.id as any)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      ativo
                        ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm font-bold'
                        : 'bg-[#FAFAFA] text-[#0A0A0A] border-[#E4E4E7] hover:border-black'
                    }`}
                  >
                    <p className="text-xs font-bold">{c.label}</p>
                    <span className={`text-[10px] ${ativo ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                      {c.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

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
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Ex: Coqueiral, Centro, Neva..."
            />

            <Input
              label="Endereço ou Ponto de Referência"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Rua Paraná, 1500"
            />
          </div>

          {/* Link Automático Google Maps e Proximidade de Célula */}
          {mapsLink && (
            <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-[#52525B]">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Localização: <strong>{bairro || endereco}</strong></span>
              </div>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-black font-extrabold hover:underline"
              >
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Destaque de Célula Próxima em tempo real */}
          {celulaProxima && (
            <div className="p-3.5 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-[#166534] font-bold">
                <Home className="w-4 h-4 text-[#166534]" />
                <span>Temos uma célula pertinho de você no {celulaProxima.bairro}!</span>
              </div>
              <p className="text-[#15803D]">
                <strong>{celulaProxima.nome}</strong> reúne toda {celulaProxima.dia_semana} às {celulaProxima.horario}.
              </p>
            </div>
          )}

          <Input
            label="Quem te convidou hoje?"
            value={quemConvidou}
            onChange={(e) => setQuemConvidou(e.target.value)}
            placeholder="Ex: Um amigo, Instagram, Família..."
          />

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

            <div className="md:col-span-2 space-y-3 pt-2 border-t border-[#F4F4F5]">
              <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
                Você já faz parte de alguma célula da {igrejaConfig.nome}?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setJaParticipaCelula(false);
                    setQuerCelula(true);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    !jaParticipaCelula
                      ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm font-bold'
                      : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                  }`}
                >
                  <p className="text-xs font-bold">Não participo de célula ainda</p>
                  <span className={`text-[10px] ${!jaParticipaCelula ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                    Gostaria de conhecer um grupo pertinho de mim
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setJaParticipaCelula(true);
                    setQuerCelula(false);
                  }}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    jaParticipaCelula
                      ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm font-bold'
                      : 'bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] hover:border-black'
                  }`}
                >
                  <p className="text-xs font-bold">Sim, já faço parte de uma célula</p>
                  <span className={`text-[10px] ${jaParticipaCelula ? 'text-[#D4D4D8]' : 'text-[#71717A]'}`}>
                    Já sou membro integrado de uma célula
                  </span>
                </button>
              </div>

              {jaParticipaCelula ? (
                <div className="pt-1">
                  <Input
                    label="Qual é a sua célula ou quem é seu líder?"
                    value={nomeCelulaAtual}
                    onChange={(e) => setNomeCelulaAtual(e.target.value)}
                    placeholder="Ex: Célula One Way Centro ou Líder André"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#DCFCE7]/70 border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between">
                  <span>✨ Excelente! Nossa liderança vai te indicar uma célula acolhedora na sua região.</span>
                </div>
              )}
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
              Enviar Meus Dados de Boas-Vindas
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
