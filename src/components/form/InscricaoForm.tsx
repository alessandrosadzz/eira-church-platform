// src/components/form/InscricaoForm.tsx

import React, { useState } from 'react';
import { Evento } from '../../types/evento';
import { StepIndicator } from './StepIndicator';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { formatarMoeda, formatarTelefone } from '../../lib/formatters';
import { QrCode, CreditCard, CheckCircle2, Copy, MessageCircle, AlertTriangle } from 'lucide-react';

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
  const isPago = evento.valor > 0;

  // Etapas: se gratuito, tem 2 etapas (Dados -> Sucesso). Se pago, tem 3 etapas (Dados -> Pagamento -> Sucesso)
  const etapas = isPago
    ? [
        { numero: 1, titulo: 'Seus Dados' },
        { numero: 2, titulo: 'Pagamento' },
        { numero: 3, titulo: 'Confirmação' },
      ]
    : [
        { numero: 1, titulo: 'Seus Dados' },
        { numero: 2, titulo: 'Confirmação' },
      ];

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nascimento: '',
    nome_responsavel: '',
    telefone_responsavel: '',
    email_responsavel: '',
    observacoes_saude: '',
    igreja: 'Eira Church',
    transporte: false,
    participa_celula: false,
    nome_celula_lider: '',
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [metodoSelecionado, setMetodoSelecionado] = useState<'pix' | 'cartao'>('pix');
  const [codigoPixCopiaCola, setCodigoPixCopiaCola] = useState('');
  const [codigoComprovante, setCodigoComprovante] = useState('');

  // Lógica de Menor de Idade
  const calcularIdade = (dataNasc: string): number | null => {
    if (!dataNasc) return null;
    const nascimento = new Date(dataNasc);
    if (isNaN(nascimento.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const idadeCalculada = calcularIdade(formData.nascimento);
  const isMenor = idadeCalculada !== null && idadeCalculada < 18;

  // Validação da Etapa 1
  const validarEtapa1 = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Informe seu nome completo.';
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = 'Informe seu telefone / WhatsApp com DDD.';
    }

    if (evento.campos.includes('nascimento') && !formData.nascimento) {
      novosErros.nascimento = 'Informe sua data de nascimento.';
    }

    if (isMenor) {
      if (!formData.nome_responsavel.trim()) {
        novosErros.nome_responsavel = 'Nome do pai, mãe ou responsável é obrigatório para menores de 18 anos.';
      }
      if (!formData.telefone_responsavel.trim()) {
        novosErros.telefone_responsavel = 'WhatsApp do responsável é obrigatório para contato de emergência.';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleAvancarEtapa1 = () => {
    if (!validarEtapa1()) {
      erro('Preencha os campos obrigatórios para avançar.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isPago) {
        // Gera codigo Pix simulado caso o evento seja pago
        const hashRandom = Math.random().toString(36).substring(2, 10).toUpperCase();
        setCodigoPixCopiaCola(`00020126580014br.gov.bcb.pix0136eira-church-${hashRandom}520400005303986540${evento.valor.toFixed(2)}5802BR5911EIRA CHURCH`);
        setEtapaAtual(2);
      } else {
        // Evento gratuito: vai direto para sucesso
        const comprovante = `EIRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setCodigoComprovante(comprovante);
        setEtapaAtual(2);
        sucesso('Inscrição confirmada com sucesso!');
      }
    }, 300);
  };

  const handleFinalizarPagamento = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const comprovante = `EIRA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setCodigoComprovante(comprovante);
      setEtapaAtual(3);
      sucesso('Pagamento identificado e inscrição confirmada!');
    }, 600);
  };

  const copiarPix = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(codigoPixCopiaCola);
      info('Código Pix copiado para a área de transferência!');
    }
  };

  const abrirWhatsAppComprovante = () => {
    const texto = `*Comprovante de Inscrição — Eira Church*%0A%0A*Evento:* ${evento.nome}%0A*Participante:* ${formData.nome}%0A*Código:* ${codigoComprovante}%0A*Status:* Confirmado%0A%0ANos vemos lá!`;
    const url = `https://wa.me/?text=${texto}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-6">
      <StepIndicator etapaAtual={etapaAtual} etapas={etapas} />

      {/* ==================================================== */}
      {/* ETAPA 1: DADOS PESSOAIS */}
      {/* ==================================================== */}
      {etapaAtual === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAvancarEtapa1();
          }}
          className="space-y-4"
        >
          <Input
            label="Nome Completo"
            required
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            error={erros.nome}
            placeholder="Seu nome e sobrenome"
            autoComplete="name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp / Telefone com DDD"
              required
              type="tel"
              inputMode="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
              error={erros.telefone}
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />

            <Input
              label="E-mail"
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data de Nascimento"
              required
              type="date"
              value={formData.nascimento}
              onChange={(e) => setFormData({ ...formData, nascimento: e.target.value })}
              error={erros.nascimento}
              helperText={
                idadeCalculada !== null
                  ? `Idade identificada: ${idadeCalculada} anos`
                  : undefined
              }
            />

            <Input
              label="Igreja de Origem"
              value={formData.igreja}
              onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
              placeholder="Ex: Eira Church"
            />
          </div>

          {/* SESSAO CONDICIONAL OBRIGATORIA: MENORES DE 18 ANOS */}
          {isMenor && (
            <div className="p-4 rounded-lg bg-[#FEF9C3] border border-[#FEF08A] space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-[#854D0E] font-bold text-xs uppercase tracking-tight">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Participante Menor de 18 Anos — Identificação dos Pais Obrigatória</span>
              </div>
              <p className="text-xs text-[#713F12]">
                Por segurança da Eira Church e exigência legal, informe os dados de contato do pai, mãe ou responsável legal.
              </p>
              <div className="space-y-3 pt-1">
                <Input
                  label="Nome do Responsável Legal"
                  required
                  value={formData.nome_responsavel}
                  onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                  error={erros.nome_responsavel}
                  placeholder="Nome completo da mãe ou do pai"
                />
                <Input
                  label="WhatsApp do Responsável"
                  required
                  type="tel"
                  inputMode="tel"
                  value={formData.telefone_responsavel}
                  onChange={(e) => setFormData({ ...formData, telefone_responsavel: formatarTelefone(e.target.value) })}
                  error={erros.telefone_responsavel}
                  placeholder="(00) 00000-0000"
                />
                <Input
                  label="E-mail do Responsável (Opcional)"
                  type="email"
                  value={formData.email_responsavel || ''}
                  onChange={(e) => setFormData({ ...formData, email_responsavel: e.target.value })}
                  placeholder="responsavel@email.com"
                  helperText="Para envio de autorização e cópia do comprovante"
                />
              </div>
            </div>
          )}

          {/* CAMPO DE SAUDE & ALERGIAS */}
          <Textarea
            label="Restrições Alimentares / Alergias / Cuidados Médicos"
            value={formData.observacoes_saude}
            onChange={(e) => setFormData({ ...formData, observacoes_saude: e.target.value })}
            placeholder="Ex: intolerância a lactose, alergia a amendoim, medicamento contínuo..."
            helperText="Informações confidenciais encaminhadas para a equipe médica e de alimentação do evento."
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
              {isPago ? `Prosseguir para Pagamento (${formatarMoeda(evento.valor)})` : 'Concluir Inscrição Gratuita'}
            </Button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* ETAPA 2: PAGAMENTO (SE PAGO) */}
      {/* ==================================================== */}
      {isPago && etapaAtual === 2 && (
        <div className="space-y-6 text-left">
          {/* Seletor de Metodo */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodoSelecionado('pix')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                metodoSelecionado === 'pix'
                  ? 'border-black bg-[#FEF08A]/40 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <QrCode className="w-6 h-6 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-sm">Pix Instantâneo</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoSelecionado('cartao')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                metodoSelecionado === 'cartao'
                  ? 'border-black bg-[#FEF08A]/40 text-[#0A0A0A] font-extrabold ring-2 ring-black shadow-sm'
                  : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#F4F4F5]'
              }`}
            >
              <CreditCard className="w-6 h-6 text-[#0A0A0A]" aria-hidden="true" />
              <span className="text-sm">Cartão de Crédito</span>
            </button>
          </div>

          {/* Opcao Pix */}
          {metodoSelecionado === 'pix' && (
            <div className="p-6 rounded-xl bg-white border border-[#E4E4E7] space-y-4 text-center">
              <p className="text-xs font-bold text-[#71717A] uppercase tracking-tight">
                Escaneie o QR Code no app do seu banco
              </p>

              {/* QR Code Simulado e Acessivel */}
              <div className="w-48 h-48 mx-auto bg-white border-2 border-black p-3 rounded-lg flex flex-col items-center justify-center shadow-sm">
                <div className="w-full h-full bg-[#0A0A0A] rounded flex flex-col items-center justify-center text-[var(--accent,#FACC15)] space-y-1 p-2">
                  <QrCode className="w-20 h-20 text-[var(--accent,#FACC15)]" aria-hidden="true" />
                  <span className="text-[10px] font-black tracking-tighter">PIX // EIRA CHURCH</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[#52525B]">Ou utilize o código Copia e Cola:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={codigoPixCopiaCola}
                    className="flex-1 px-3 py-2 text-xs bg-[#F4F4F5] border border-[#E4E4E7] rounded font-mono truncate text-[#0A0A0A]"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={copiarPix}>
                    <Copy className="w-4 h-4 mr-1" aria-hidden="true" />
                    Copiar
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-[#71717A] italic">
                Após efetuar a transferência no banco, a compensação ocorre em instantes.
              </p>
            </div>
          )}

          {/* Opcao Cartao */}
          {metodoSelecionado === 'cartao' && (
            <div className="p-6 rounded-xl bg-white border border-[#E4E4E7] space-y-4">
              <div className="space-y-3">
                <Input label="Número do Cartão" placeholder="0000 0000 0000 0000" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Validade" placeholder="MM/AA" />
                  <Input label="CVV" placeholder="123" />
                </div>
                <Input label="Nome no Cartão" placeholder="Nome exatamente como no cartão" />
              </div>
              <p className="text-[11px] text-[#71717A]">
                Ambiente criptografado e seguro processado pelo Mercado Pago.
              </p>
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
              Já realizei o pagamento
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
              Inscrição Confirmada!
            </h3>
            <p className="text-sm text-[#71717A]">
              Estamos muito felizes em ter você conosco na Eira Church.
            </p>
          </div>

          {/* Cartao do Comprovante */}
          <div className="p-5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-2">
              <span className="text-xs font-bold text-[#71717A] uppercase">Código de Inscrição</span>
              <span className="font-mono text-sm font-extrabold text-[#0A0A0A] bg-white px-2 py-0.5 rounded border border-[#E4E4E7]">
                {codigoComprovante}
              </span>
            </div>

            <div className="text-xs space-y-1 text-[#52525B]">
              <p><strong>Participante:</strong> {formData.nome}</p>
              <p><strong>Evento:</strong> {evento.nome}</p>
              <p><strong>Valor:</strong> {formatarMoeda(evento.valor)}</p>
              {isMenor && (
                <p><strong>Responsável:</strong> {formData.nome_responsavel} ({formData.telefone_responsavel})</p>
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
              Salvar Comprovante no WhatsApp
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
