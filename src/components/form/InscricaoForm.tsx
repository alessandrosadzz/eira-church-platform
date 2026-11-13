// src/components/form/InscricaoForm.tsx

import React, { useState } from 'react';
import { Evento } from '../../types/evento';
import { MetodoPagamento } from '../../types/inscricao';
import { StepIndicator } from './StepIndicator';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { formatarMoeda, formatarTelefone } from '../../lib/formatters';
import {
  QrCode,
  CreditCard,
  CheckCircle2,
  Copy,
  MessageCircle,
  AlertTriangle,
  Upload,
  FileText,
  Check,
  Clock,
  Banknote,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { salvarInscricaoSupabase } from '../../lib/eventoAdapter';

export interface InscricaoFormProps {
  evento: Evento;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const InscricaoForm: React.FC<InscricaoFormProps> = ({
  evento,
  onSuccess,
  onCancel,
}) => {
  const { sucesso, erro, info } = useToast();
  const { igrejaConfig } = useAdminStore();
  const isPago = evento.valor > 0;

  // Etapas da Pré-Inscrição do Evento
  const etapas = isPago
    ? [
        { numero: 1, titulo: 'Pré-Inscrição' },
        { numero: 2, titulo: 'Forma de Pagamento' },
        { numero: 3, titulo: 'Vaga Garantida' },
      ]
    : [
        { numero: 1, titulo: 'Pré-Inscrição' },
        { numero: 2, titulo: 'Vaga Garantida' },
      ];

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);

  // Determina rede inicial sugerida pelo evento
  const redePadraoEvento = (() => {
    if (evento.rede === 'Hype') return 'Hype';
    if (evento.rede === 'One Way') return 'One Way';
    if (evento.rede && ['Kids', 'Crianças'].includes(evento.rede)) return 'Kids';
    return 'Geral';
  })();

  // Form State inteligente para adolescentes, jovens e famílias
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    idade: '',
    rede_participante: redePadraoEvento,
    telefone: '',
    nome_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    endereco: '',
    participa_celula: 'nao' as 'sim' | 'nao',
    nome_celula_lider: '',
    observacoes_saude: '',
    email: '',
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [metodoSelecionado, setMetodoSelecionado] = useState<'pix' | 'pagar_depois' | 'dinheiro' | 'cartao'>('pix');
  const [codigoPixCopiaCola, setCodigoPixCopiaCola] = useState(
    igrejaConfig.copiaEColaPix ||
      '00020126470014BR.GOV.BCB.PIX0125eirajoinville@hotmail.com5204000053039865802BR5921Eira Church Joinville6009Joinville62140510EIRACHURCH630461FC'
  );
  const [codigoComprovante, setCodigoComprovante] = useState('');
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null);

  // Calcula a idade automaticamente com base na Data de Nascimento
  const handleDataNascimentoChange = (dataStr: string) => {
    let novaIdade = formData.idade;
    if (dataStr) {
      const parts = dataStr.split('-');
      if (parts.length === 3) {
        const anoNasc = parseInt(parts[0], 10);
        const mesNasc = parseInt(parts[1], 10) - 1;
        const diaNasc = parseInt(parts[2], 10);
        const hoje = new Date();
        let calcIdade = hoje.getFullYear() - anoNasc;
        const m = hoje.getMonth() - mesNasc;
        if (m < 0 || (m === 0 && hoje.getDate() < diaNasc)) {
          calcIdade--;
        }
        if (calcIdade >= 0 && calcIdade < 125) {
          novaIdade = String(calcIdade);
        }
      }
    }
    setFormData((prev) => ({
      ...prev,
      data_nascimento: dataStr,
      idade: novaIdade,
    }));
  };

  // Regra inteligente solicitada pelo usuário:
  // - Se for rede de jovens universitários (One Way) e/ou maior de 18 anos: NÃO coloca opção de responsável.
  // - Se for adolescente, HYPE, criança ou menor de 18 anos: coloca WhatsApp e e-mail do responsável.
  const idadeNum = parseInt(formData.idade, 10);
  const isMenorDeIdade = !isNaN(idadeNum) && idadeNum < 18;
  const isRedeTeenOuKids =
    formData.rede_participante === 'Hype' ||
    formData.rede_participante === 'Kids' ||
    evento.rede === 'Hype';
  const isRedeJovensUniversitarios =
    formData.rede_participante === 'One Way' || evento.rede === 'One Way';

  const exigeResponsavel = React.useMemo(() => {
    // Se a idade for 18 anos ou mais, é jovem/adulto independente: não exige responsável
    if (!isNaN(idadeNum) && idadeNum >= 18) {
      return false;
    }
    // Se a idade for menor que 18 anos:
    if (isMenorDeIdade) {
      return true;
    }
    // Se for da rede Hype ou Kids:
    if (isRedeTeenOuKids) {
      return true;
    }
    // Se for da rede One Way (jovens universitários) e não é menor explícito:
    if (isRedeJovensUniversitarios) {
      return false;
    }
    return false;
  }, [idadeNum, isMenorDeIdade, isRedeTeenOuKids, isRedeJovensUniversitarios]);

  const handleUploadComprovante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      erro('O comprovante deve ter no máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setComprovanteUrl(dataUrl);
      sucesso('Comprovante anexado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  // Validação da Etapa 1
  const validarEtapa1 = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Informe seu nome completo.';
    }

    if (!formData.idade.trim()) {
      novosErros.idade = 'Informe sua idade ou data de nascimento.';
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Informe seu telefone / WhatsApp com DDD.';
    }

    // Validação de responsável apenas quando for menor ou rede adolescente/kids
    if (exigeResponsavel) {
      if (!formData.telefone_responsavel.trim()) {
        novosErros.telefone_responsavel = 'Informe o WhatsApp/telefone de um responsável.';
      }
      if (!formData.email_responsavel.trim()) {
        novosErros.email_responsavel = 'Informe o e-mail do responsável para envio das autorizações.';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleAvancarEtapa1 = async () => {
    if (!validarEtapa1()) {
      erro('Preencha os campos obrigatórios para avançar.');
      return;
    }

    if (isPago) {
      // Evento com taxa: avança para a escolha da forma de pagamento da pré-inscrição
      setEtapaAtual(2);
    } else {
      // Evento gratuito: salva diretamente no Supabase e no cache local
      setLoading(true);
      const comprovante = `EIRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      await salvarInscricaoSupabase({
        evento_id: evento.id,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        nascimento: formData.data_nascimento || null,
        idade: formData.idade,
        nome_responsavel: exigeResponsavel ? formData.nome_responsavel : null,
        telefone_responsavel: exigeResponsavel ? formData.telefone_responsavel : null,
        email_responsavel: exigeResponsavel ? formData.email_responsavel : null,
        rede_participante: formData.rede_participante,
        endereco: formData.endereco,
        participa_celula: formData.participa_celula === 'sim',
        nome_celula_lider: formData.nome_celula_lider,
        observacoes_saude: formData.observacoes_saude,
        status: 'isento',
        metodo_pag: 'isento',
        valor_pago: 0,
        codigo_inscricao: comprovante,
        evento_nome: evento.nome,
      });

      setLoading(false);
      setCodigoComprovante(comprovante);
      setEtapaAtual(2);
      sucesso('Inscrição gratuita confirmada com sucesso!');
    }
  };

  const handleFinalizarPagamento = async () => {
    setLoading(true);
    const comprovante = `EIRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await salvarInscricaoSupabase({
      evento_id: evento.id,
      nome: formData.nome,
      telefone: formData.telefone,
      email: formData.email,
      nascimento: formData.data_nascimento || null,
      idade: formData.idade,
      nome_responsavel: exigeResponsavel ? formData.nome_responsavel : null,
      telefone_responsavel: exigeResponsavel ? formData.telefone_responsavel : null,
      email_responsavel: exigeResponsavel ? formData.email_responsavel : null,
      rede_participante: formData.rede_participante,
      endereco: formData.endereco,
      participa_celula: formData.participa_celula === 'sim',
      nome_celula_lider: formData.nome_celula_lider,
      observacoes_saude: formData.observacoes_saude,
      status: 'pendente',
      metodo_pag: metodoSelecionado === 'pagar_depois' ? 'balcao' : (metodoSelecionado as MetodoPagamento),
      valor_pago: evento.valor,
      codigo_inscricao: comprovante,
      comprovante_url: comprovanteUrl,
      evento_nome: evento.nome,
    });

    setLoading(false);
    setCodigoComprovante(comprovante);
    setEtapaAtual(3);
    sucesso('Pré-inscrição realizada com sucesso! Sua vaga está garantida.');
  };

  const copiarPix = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(codigoPixCopiaCola);
      info('Código Pix copiado para a área de transferência!');
    }
  };

  const abrirWhatsAppComprovante = () => {
    const metodoLabel = {
      pix: 'Pix Instantâneo',
      pagar_depois: 'Pagar Depois / Presencialmente',
      dinheiro: 'Dinheiro em Espécie (Secretaria)',
      cartao: 'Cartão Presencial (Secretaria)',
    }[metodoSelecionado];

    const texto = `*Comprovante de Pré-Inscrição — Eira Church*%0A%0A*Evento:* ${evento.nome}%0A*Participante:* ${formData.nome}%0A*Código de Vaga:* ${codigoComprovante}%0A*Valor:* ${formatarMoeda(evento.valor)}%0A*Forma Pretendida:* ${metodoLabel}%0A%0ANos vemos lá!`;
    const url = `https://wa.me/?text=${texto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-6">
      <StepIndicator etapaAtual={etapaAtual} etapas={etapas} />

      {/* ==================================================== */}
      {/* ETAPA 1: DADOS PESSOAIS // ADOLESCENTES & EVENTOS */}
      {/* ==================================================== */}
      {etapaAtual === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAvancarEtapa1();
          }}
          className="space-y-4"
        >
          {/* 1. Nome Completo */}
          <Input
            label="Nome Completo"
            required
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            error={erros.nome}
            placeholder="Seu nome e sobrenome"
            autoComplete="name"
          />

          {/* 2. Seleção de Rede / Faixa Etária */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Sua Rede / Faixa Etária
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rede_participante: 'Hype' })}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.rede_participante === 'Hype'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                ⚡ HYPE (Teens)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rede_participante: 'One Way' })}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.rede_participante === 'One Way'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                🚀 One Way (Jovens)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rede_participante: 'Kids' })}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.rede_participante === 'Kids'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                🎈 Kids (Crianças)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rede_participante: 'Adultos' })}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.rede_participante === 'Adultos' || formData.rede_participante === 'Geral'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-xs'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                👥 Adultos / Família
              </button>
            </div>
          </div>

          {/* 3. Data de Nascimento & Idade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data de Nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleDataNascimentoChange(e.target.value)}
              helperText={
                formData.idade
                  ? `${formData.idade} anos ${isMenorDeIdade ? '(Menor de 18 anos)' : '(Maior de idade)'}`
                  : 'Calcula a idade automaticamente'
              }
            />

            <Input
              label="Idade"
              required
              type="number"
              min="1"
              max="120"
              value={formData.idade}
              onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
              error={erros.idade}
              placeholder="Ex: 15"
              helperText={
                isMenorDeIdade
                  ? '🛡️ Adolescente / Criança (Requer responsável)'
                  : '🎓 Jovem / Adulto (Inscrição direta)'
              }
            />
          </div>

          {/* 4. WhatsApp & E-mail do Participante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp / Telefone com DDD"
              required
              type="tel"
              inputMode="tel"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })
              }
              error={erros.telefone}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />

            <Input
              label="E-mail do Participante"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          {/* 5. SEÇÃO DE CONTATOS DO RESPONSÁVEL (Apenas para Adolescentes/Crianças/Hype ou < 18 anos) */}
          {exigeResponsavel ? (
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-3 text-left">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
                <h4 className="text-xs font-bold uppercase tracking-tight text-[#1E40AF]">
                  Contatos do Responsável (Obrigatório para Adolescentes / Crianças / HYPE)
                </h4>
              </div>
              <p className="text-[11px] text-[#3B82F6]">
                Informe o WhatsApp e e-mail dos pais ou responsável para confirmação e autorização do evento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="WhatsApp / Telefone do Responsável"
                  required
                  type="tel"
                  inputMode="tel"
                  value={formData.telefone_responsavel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      telefone_responsavel: formatarTelefone(e.target.value),
                    })
                  }
                  error={erros.telefone_responsavel}
                  placeholder="(00) 00000-0000"
                  helperText="Pai, mãe ou responsável legal"
                />

                <Input
                  label="E-mail do Responsável"
                  required
                  type="email"
                  value={formData.email_responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, email_responsavel: e.target.value })
                  }
                  error={erros.email_responsavel}
                  placeholder="emaildospais@exemplo.com"
                  helperText="Para envio de autorizações e informes"
                />
              </div>

              <div>
                <Input
                  label="Nome do Responsável (Opcional)"
                  value={formData.nome_responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_responsavel: e.target.value })
                  }
                  placeholder="Ex: Carlos Oliveira (Pai)"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-left flex items-center space-x-2 text-xs text-[#52525B]">
              <span className="p-1 rounded bg-[#E4E4E7] text-[#0A0A0A] font-bold text-[10px]">
                {formData.rede_participante === 'One Way' ? 'ONE WAY' : '18+'}
              </span>
              <span>
                <strong>Rede de Jovens / Universitários:</strong> Inscrição individual sem necessidade de dados de responsável.
              </span>
            </div>
          )}

          {/* 6. Endereço */}
          <Input
            label="Endereço (Bairro / Cidade)"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            placeholder="Ex: Rua das Flores, Bairro Aventureiro"
          />

          {/* 4. Participa de alguma célula? */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3 text-left">
            <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Participa de alguma célula da Eira Church?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, participa_celula: 'nao' })}
                className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.participa_celula === 'nao'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-sm'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                Não participo ainda
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, participa_celula: 'sim' })}
                className={`py-2.5 px-4 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  formData.participa_celula === 'sim'
                    ? 'border-black bg-black text-[var(--accent,#FACC15)] shadow-sm'
                    : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
                }`}
              >
                Sim, já participo
              </button>
            </div>

            {formData.participa_celula === 'sim' && (
              <div className="pt-2 animate-fadeIn">
                <Input
                  label="Qual é a sua célula ou nome do líder?"
                  value={formData.nome_celula_lider}
                  onChange={(e) => setFormData({ ...formData, nome_celula_lider: e.target.value })}
                  placeholder="Ex: Célula Teens Aventureiro / Líder João"
                />
              </div>
            )}
          </div>

          {/* 5. Observações (Alergias, Remédios, etc.) */}
          <Textarea
            label="Observações (Alergias, Remédios, Cuidados Especiais)"
            value={formData.observacoes_saude}
            onChange={(e) => setFormData({ ...formData, observacoes_saude: e.target.value })}
            placeholder="Ex: intolerância a lactose, alergia a amendoim, remédio de uso contínuo..."
            helperText="Informações confidenciais encaminhadas para os monitores e equipe médica do evento."
            rows={2}
          />

          {/* BOTÕES DE AÇÃO */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#E4E4E7]">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth={!onCancel}
              isLoading={loading}
              className="ml-auto"
            >
              {isPago
                ? `Avançar para Forma de Pagamento (${formatarMoeda(evento.valor)})`
                : 'Concluir Inscrição Gratuita'}
            </Button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* ETAPA 2: PRÉ-INSCRIÇÃO & FORMA DE PAGAMENTO */}
      {/* ==================================================== */}
      {isPago && etapaAtual === 2 && (
        <div className="space-y-6 text-left animate-fadeIn">
          {/* Cabeçalho Orientador */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="flex items-center space-x-2 text-[#0A0A0A] font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-[var(--accent,#FACC15)]" />
              <span>Como você pretende realizar o pagamento?</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Você pode pagar agora via <strong>PIX</strong> para liberação imediata, ou <strong>garantir sua vaga agora e pagar depois</strong> (no dia do culto ou quando os pais liberarem).
            </p>
          </div>

          {/* Seletor de 4 Opções */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setMetodoSelecionado('pix')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                metodoSelecionado === 'pix'
                  ? 'border-black bg-[#FEF08A]/50 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <QrCode className="w-5 h-5 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-xs font-bold leading-tight">Pix Agora</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSelecionado('pagar_depois')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                metodoSelecionado === 'pagar_depois'
                  ? 'border-black bg-[#FEF08A]/50 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <Clock className="w-5 h-5 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-xs font-bold leading-tight">Pagar Depois</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSelecionado('dinheiro')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                metodoSelecionado === 'dinheiro'
                  ? 'border-black bg-[#FEF08A]/50 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <Banknote className="w-5 h-5 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-xs font-bold leading-tight">Dinheiro</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSelecionado('cartao')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                metodoSelecionado === 'cartao'
                  ? 'border-black bg-[#FEF08A]/50 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <CreditCard className="w-5 h-5 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-xs font-bold leading-tight">Cartão</span>
            </button>
          </div>

          {/* Opcao 1: Pix */}
          {metodoSelecionado === 'pix' && (
            <div className="p-6 rounded-2xl bg-white border border-[#E4E4E7] space-y-5 text-center shadow-sm">
              <div className="space-y-1">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E]">
                  ⚡ Pagamento Instantâneo via PIX
                </span>
                <h4 className="text-base font-extrabold text-[#0A0A0A]">
                  Escaneie o QR Code ou Use o Copia e Cola
                </h4>
                <p className="text-xs text-[#71717A]">
                  Abra o app do seu banco, selecione PIX e aponte a câmera para o QR Code abaixo:
                </p>
              </div>

              {/* QR Code Oficial Eira Church */}
              <div className="inline-block p-3 rounded-2xl bg-white border-2 border-black shadow-md mx-auto">
                <img
                  src={igrejaConfig.qrCodePixUrl || '/pix-qrcode.png'}
                  alt="QR Code Pix Oficial Eira Church"
                  className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg mx-auto"
                />
              </div>

              {/* Dados Bancários Oficiais */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-left text-xs space-y-1.5 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-semibold">Titular / Favorecido:</span>
                  <span className="font-extrabold text-[#0F172A]">{igrejaConfig.titularPix || 'Eira Church Joinville'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-semibold">Chave PIX (E-mail):</span>
                  <span className="font-mono font-bold text-[#0F172A]">{igrejaConfig.chavePix || 'eirajoinville@hotmail.com'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-semibold">Cidade:</span>
                  <span className="font-bold text-[#0F172A]">{igrejaConfig.cidadePix || 'Joinville'}</span>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-1.5">
                  <span className="text-[#64748B] font-semibold">Valor da Inscrição:</span>
                  <span className="text-sm font-black text-black">{formatarMoeda(evento.valor)}</span>
                </div>
              </div>

              {/* Copia e Cola */}
              <div className="space-y-2 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#52525B]">Código Pix Copia e Cola:</span>
                  <span className="text-[11px] text-[#A1A1AA]">Toque para copiar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={codigoPixCopiaCola}
                    className="flex-1 px-3 py-2.5 text-xs bg-[#F4F4F5] border border-[#E4E4E7] rounded-lg font-mono truncate text-[#0A0A0A] font-medium"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={copiarPix}>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar
                  </Button>
                </div>
              </div>

              {/* UPLOAD DO COMPROVANTE */}
              <div className="pt-2 text-left max-w-md mx-auto space-y-2 border-t border-[#F4F4F5]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold uppercase tracking-tight text-[#0A0A0A]">
                    📸 Anexar Comprovante (Opcional agora)
                  </label>
                  {comprovanteUrl && (
                    <span className="text-[11px] font-bold text-[#16a34a] bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Anexado
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#71717A]">
                  Se já realizou o PIX, anexe a foto ou print para a secretaria liberar sua inscrição de imediato.
                </p>

                {comprovanteUrl ? (
                  <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img
                        src={comprovanteUrl}
                        alt="Comprovante"
                        className="w-12 h-12 object-cover rounded-lg border border-[#86EFAC] shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#166534] flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 shrink-0" />
                          Comprovante carregado
                        </p>
                        <p className="text-[11px] text-[#15803D] truncate">
                          Pronto para envio com sua vaga
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setComprovanteUrl(null)}
                      className="text-xs font-bold text-[#DC2626] hover:underline shrink-0 ml-2"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#D4D4D8] hover:border-black rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FAFAFA] hover:bg-[#F4F4F5]">
                    <Upload className="w-6 h-6 text-[#71717A] mb-1.5" />
                    <span className="text-xs font-bold text-[#0A0A0A]">
                      Clique para anexar o comprovante
                    </span>
                    <span className="text-[10px] text-[#71717A] mt-0.5">
                      Foto, print ou PDF (máx. 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleUploadComprovante}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Opção alternativa de WhatsApp */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const texto = `Olá! Fiz meu pré-cadastro no evento *${evento.nome}* da Eira Church pelo valor de *${formatarMoeda(evento.valor)}*. Participante: *${formData.nome}*`;
                      const numeroIgreja = igrejaConfig.whatsapp.replace(/\D/g, '');
                      const url = numeroIgreja
                        ? `https://wa.me/55${numeroIgreja}?text=${encodeURIComponent(texto)}`
                        : `https://wa.me/?text=${encodeURIComponent(texto)}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full text-center py-2 px-3 text-xs font-bold text-[#15803D] hover:text-[#166534] flex items-center justify-center space-x-1.5 hover:underline cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Ou envie direto no WhatsApp da Eira Church</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Opcao 2: Pagar Depois */}
          {metodoSelecionado === 'pagar_depois' && (
            <div className="p-6 rounded-2xl bg-white border border-[#E4E4E7] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2.5 text-[#854D0E] bg-[#FEF9C3] p-4 rounded-xl border border-[#FEF08A]">
                <Clock className="w-6 h-6 shrink-0 text-[#CA8A04]" />
                <div>
                  <p className="font-extrabold text-sm">Garantir Minha Vaga Agora // Pagar Depois</p>
                  <p className="text-xs text-[#713F12]">
                    Opção pensada para adolescentes, jovens e famílias que desejam garantir a vaga já!
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#52525B] space-y-2 leading-relaxed bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F5]">
                <p>
                  ✅ <strong>Sua vaga fica reservada imediatamente</strong> no sistema da igreja.
                </p>
                <p>
                  💳 Você poderá realizar o pagamento de <strong>{formatarMoeda(evento.valor)}</strong> mais tarde via PIX (chave: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-black border border-[#E4E4E7]">{igrejaConfig.chavePix || 'eirajoinville@hotmail.com'}</code>) ou pessoalmente no dia do culto com os líderes e secretaria.
                </p>
                <p className="text-[11px] text-[#71717A] italic">
                  Você receberá um código de pré-inscrição para apresentar quando for acertar o valor.
                </p>
              </div>
            </div>
          )}

          {/* Opcao 3: Dinheiro */}
          {metodoSelecionado === 'dinheiro' && (
            <div className="p-6 rounded-2xl bg-white border border-[#E4E4E7] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2.5 text-[#166534] bg-[#DCFCE7] p-4 rounded-xl border border-[#BBF7D0]">
                <Banknote className="w-6 h-6 shrink-0 text-[#16a34a]" />
                <div>
                  <p className="font-extrabold text-sm">Pagamento em Dinheiro na Secretaria</p>
                  <p className="text-xs text-[#15803D]">
                    Sua vaga é reservada e você realiza o acerto presencialmente.
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#52525B] space-y-2 bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F5]">
                <p>
                  Procure a secretaria ou a liderança da igreja no próximo culto de domingo ou encontro de célula e informe seu nome para entregar o valor de <strong>{formatarMoeda(evento.valor)}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Opcao 4: Cartão */}
          {metodoSelecionado === 'cartao' && (
            <div className="p-6 rounded-2xl bg-white border border-[#E4E4E7] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2.5 text-[#1E40AF] bg-[#DBEAFE] p-4 rounded-xl border border-[#BFDBFE]">
                <CreditCard className="w-6 h-6 shrink-0 text-[#2563EB]" />
                <div>
                  <p className="font-extrabold text-sm">Cartão Presencial na Secretaria</p>
                  <p className="text-xs text-[#1E3A8A]">
                    Passe seu cartão no débito ou crédito na maquininha da igreja.
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#52525B] space-y-2 bg-[#FAFAFA] p-4 rounded-xl border border-[#F4F4F5]">
                <p>
                  Sua vaga é garantida agora! No balcão de atendimento da igreja você passa o cartão pelo valor de <strong>{formatarMoeda(evento.valor)}</strong> e a secretaria dá a confirmação oficial no sistema.
                </p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E4E4E7]">
            <Button variant="ghost" onClick={() => setEtapaAtual(1)}>
              ← Voltar aos Dados
            </Button>
            <Button
              variant="primary"
              isLoading={loading}
              onClick={handleFinalizarPagamento}
            >
              {metodoSelecionado === 'pix'
                ? comprovanteUrl
                  ? 'Concluir com Comprovante'
                  : 'Concluir Pré-Inscrição via PIX'
                : 'Garantir Minha Vaga (Concluir Pré-Inscrição)'}
            </Button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ETAPA FINAL: CONFIRMAÇÃO E COMPROVANTE */}
      {/* ==================================================== */}
      {((!isPago && etapaAtual === 2) || (isPago && etapaAtual === 3)) && (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center border-2 border-[#BBF7D0]">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              {isPago && metodoSelecionado === 'pagar_depois'
                ? 'Pré-Inscrição Realizada com Sucesso!'
                : 'Inscrição Confirmada!'}
            </h3>
            <p className="text-sm text-[#71717A]">
              {isPago && metodoSelecionado === 'pagar_depois'
                ? 'Sua vaga no evento está reservada! Seja muito bem-vindo(a).'
                : 'Estamos muito felizes em ter você conosco na Eira Church.'}
            </p>
          </div>

          {/* Cartao do Comprovante */}
          <div className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2">
              <span className="text-xs font-bold text-[#71717A] uppercase">Código de Vaga / Inscrição</span>
              <span className="font-mono text-sm font-extrabold text-[#0A0A0A] bg-white px-2 py-0.5 rounded border border-[#E4E4E7]">
                {codigoComprovante}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-[#52525B]">
              <p><strong>Participante:</strong> {formData.nome}</p>
              <p><strong>Evento:</strong> {evento.nome}</p>
              <p><strong>Valor:</strong> {formatarMoeda(evento.valor)}</p>
              {isPago && (
                <p>
                  <strong>Forma Escolhida:</strong>{' '}
                  <span className="font-bold text-[#0A0A0A]">
                    {{
                      pix: 'Pix Instantâneo',
                      pagar_depois: 'Pagar Depois / Presencialmente',
                      dinheiro: 'Dinheiro na Secretaria',
                      cartao: 'Cartão na Secretaria',
                    }[metodoSelecionado]}
                  </span>
                </p>
              )}
              {formData.telefone_responsavel ? (
                <div className="pt-1.5 border-t border-[#E4E4E7] space-y-0.5 text-[#1E40AF]">
                  <p>
                    <strong>WhatsApp Responsável:</strong> {formData.telefone_responsavel}
                  </p>
                  {formData.email_responsavel && (
                    <p>
                      <strong>E-mail Responsável:</strong> {formData.email_responsavel}
                    </p>
                  )}
                  {formData.nome_responsavel && (
                    <p>
                      <strong>Nome Responsável:</strong> {formData.nome_responsavel}
                    </p>
                  )}
                </div>
              ) : (
                <div className="pt-1 text-[#52525B]">
                  <p>
                    <strong>Perfil:</strong> Rede {formData.rede_participante || 'Jovens'} (Inscrição individual 18+)
                  </p>
                </div>
              )}
              {comprovanteUrl && (
                <p className="text-[#166534] font-bold flex items-center pt-1 border-t border-[#E4E4E7]">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Comprovante de pagamento anexado com sucesso para validação.
                </p>
              )}
              {isPago && metodoSelecionado === 'pagar_depois' && (
                <div className="p-2.5 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] text-[#854D0E] text-[11px] font-medium mt-2">
                  💡 <strong>Importante:</strong> Quando for realizar o pagamento, use o PIX da igreja (<code>{igrejaConfig.chavePix || 'eirajoinville@hotmail.com'}</code>) ou pague presencialmente na secretaria informando seu código <strong>{codigoComprovante}</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Botões de Compartilhamento e Fechamento */}
          <div className="space-y-3 pt-2">
            <Button
              variant="dark"
              fullWidth
              onClick={abrirWhatsAppComprovante}
              className="bg-[#25D366] hover:bg-[#20BA5C] text-white border-none"
            >
              <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
              Salvar Minha Vaga no WhatsApp
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                if (onSuccess) onSuccess();
                else if (onCancel) onCancel();
              }}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
