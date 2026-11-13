'use client';

// src/components/admin/EventoForm.tsx

import React, { useState, useEffect } from 'react';
import { Evento, CategoriaEvento, CampoDisponivel } from '../../types/evento';
import { slugifyEvento, slugify } from '../../lib/slugify';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import { Check, Calendar, MapPin, Image, Link, ShieldCheck } from 'lucide-react';

export interface EventoFormProps {
  eventoInicial?: Evento | null;
  onSalvar: (evento: Partial<Evento>) => Promise<void>;
  onCancelar?: () => void;
}

const TODOS_CAMPOS: { id: CampoDisponivel; label: string; obrigatorioBase?: boolean; desc?: string }[] = [
  { id: 'nome', label: 'Nome Completo', obrigatorioBase: true, desc: 'Identificação principal' },
  { id: 'telefone', label: 'Telefone / WhatsApp', desc: 'Contato e confirmação de pagamento' },
  { id: 'nascimento', label: 'Data de Nascimento', desc: 'Calcula idade e solicita dados de responsáveis se < 18' },
  { id: 'email', label: 'E-mail do Participante', desc: 'Envio de comprovante digital' },
  { id: 'email_responsavel', label: 'E-mail do Responsável (Opcional)', desc: 'Para cópia aos pais de menores' },
  { id: 'observacoes_saude', label: 'Saúde, Alergias e Cuidados', desc: 'Essencial para retiros e acampamentos' },
  { id: 'igreja', label: 'Igreja de Origem', desc: 'Caso participe de outra congregação' },
  { id: 'transporte', label: 'Precisa de Ônibus / Transporte?', desc: 'Logística de embarque' },
  { id: 'participa_celula', label: 'Participa de Célula?', desc: 'Engajamento comunitário' },
  { id: 'nome_celula_lider', label: 'Nome do Líder da Célula', desc: 'Acompanhamento pastoral' },
];

export const EventoForm: React.FC<EventoFormProps> = ({
  eventoInicial,
  onSalvar,
  onCancelar,
}) => {
  const { sucesso, erro } = useToast();
  const [isSalvando, setIsSalvando] = useState(false);

  // Form State
  const [nome, setNome] = useState(eventoInicial?.nome || '');
  const [slug, setSlug] = useState(eventoInicial?.slug || '');
  const [descricao, setDescricao] = useState(eventoInicial?.descricao || '');
  const [dataInicio, setDataInicio] = useState(eventoInicial?.data_inicio || '');
  const [dataFim, setDataFim] = useState(eventoInicial?.data_fim || '');
  const [vagas, setVagas] = useState<number>(eventoInicial?.vagas || 100);
  const [valor, setValor] = useState<number>(eventoInicial?.valor || 0);
  const [categoria, setCategoria] = useState<CategoriaEvento>(eventoInicial?.categoria || 'Acampamento');
  const [rede, setRede] = useState<'Hype' | 'One Way' | 'Padrão'>(eventoInicial?.rede || 'Hype');
  const [localNome, setLocalNome] = useState(eventoInicial?.local_nome || 'Auditório Principal — Eira Church');
  const [imagemUrl, setImagemUrl] = useState(eventoInicial?.imagem_url || '');

  // Chips de campos selecionados
  const [camposSelecionados, setCamposSelecionados] = useState<CampoDisponivel[]>(
    eventoInicial?.campos || ['nome', 'telefone', 'nascimento', 'observacoes_saude']
  );

  // Efeito para sincronizar quando o eventoInicial mudar
  useEffect(() => {
    if (eventoInicial) {
      setNome(eventoInicial.nome || '');
      setSlug(eventoInicial.slug || '');
      setDescricao(eventoInicial.descricao || '');
      setDataInicio(eventoInicial.data_inicio || '');
      setDataFim(eventoInicial.data_fim || '');
      setVagas(eventoInicial.vagas || 100);
      setValor(eventoInicial.valor || 0);
      setCategoria(eventoInicial.categoria || 'Acampamento');
      setRede(eventoInicial.rede || 'Hype');
      setLocalNome(eventoInicial.local_nome || 'Auditório Principal — Eira Church');
      setImagemUrl(eventoInicial.imagem_url || '');
      setCamposSelecionados(
        eventoInicial.campos || ['nome', 'telefone', 'nascimento', 'observacoes_saude']
      );
    } else {
      setNome('');
      setSlug('');
      setDescricao('');
      setDataInicio('');
      setDataFim('');
      setVagas(100);
      setValor(0);
      setCategoria('Acampamento');
      setRede('Hype');
      setLocalNome('Auditório Principal — Eira Church');
      setImagemUrl('');
      setCamposSelecionados(['nome', 'telefone', 'nascimento', 'observacoes_saude']);
    }
  }, [eventoInicial]);

  // Auto-geração inteligente de Slug
  const handleNomeChange = (novoNome: string) => {
    setNome(novoNome);
    if (!eventoInicial) {
      setSlug(slugifyEvento(novoNome));
    }
  };

  const toggleCampo = (campoId: CampoDisponivel) => {
    if (campoId === 'nome') return; // Nome é sempre obrigatório e permanente
    if (camposSelecionados.includes(campoId)) {
      setCamposSelecionados(camposSelecionados.filter((c) => c !== campoId));
    } else {
      setCamposSelecionados([...camposSelecionados, campoId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      erro('Informe o nome do evento.');
      return;
    }

    if (!dataInicio) {
      erro('Informe a data de início do evento.');
      return;
    }

    if (vagas <= 0) {
      erro('A quantidade de vagas deve ser maior que zero.');
      return;
    }

    setIsSalvando(true);
    try {
      await onSalvar({
        id: eventoInicial?.id,
        nome: nome.trim(),
        slug: slugify(slug),
        descricao: descricao.trim() || null,
        data_inicio: dataInicio,
        data_fim: dataFim || null,
        vagas: Number(vagas),
        valor: Number(valor),
        categoria,
        rede,
        campos: camposSelecionados,
        local_nome: localNome.trim(),
        imagem_url: imagemUrl.trim() || null,
        ativo: true,
      });

      sucesso(eventoInicial ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
    } catch {
      erro('Falha ao salvar evento. Verifique os dados e tente novamente.');
    } finally {
      setIsSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-left max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm"
    >
      <div className="border-b border-[#E4E4E7] pb-4">
        <h3 className="text-xl font-bold tracking-tight text-[#0A0A0A]">
          {eventoInicial ? 'Editar Evento' : 'Cadastrar Novo Evento'}
        </h3>
        <p className="text-xs text-[#71717A]">
          Defina as informações oficiais, banners e campos dinâmicos de inscrição para o evento.
        </p>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do Evento */}
        <div className="md:col-span-2">
          <Input
            label="Nome do Evento"
            required
            value={nome}
            onChange={(e) => handleNomeChange(e.target.value)}
            placeholder="Ex: Retiro Hype // Intensidade & Propósito"
          />
        </div>

        {/* Slug e Preview de URL */}
        <div className="md:col-span-2 space-y-1.5">
          <Input
            label="Identificador Único (Slug da URL)"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder="retiro-hype-mar-2025"
          />
          <p className="text-xs text-[#71717A] flex items-center gap-1.5 pt-1">
            <Link className="w-3.5 h-3.5 text-[#A1A1AA]" aria-hidden="true" />
            <span>Link direto de inscrição:</span>
            <span className="font-mono text-black font-semibold bg-[#F4F4F5] px-1.5 py-0.5 rounded border border-[#E4E4E7]">
              https://eventos.eirachurch.com.br/evento/{slug || '...'}
            </span>
          </p>
        </div>

        {/* Rede e Categoria */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
            Rede Ministerial
          </label>
          <select
            value={rede}
            onChange={(e) => setRede(e.target.value as any)}
            className="w-full h-12 px-4 rounded-lg bg-white border border-[#E4E4E7] text-base text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="Hype">Rede Hype (Teens / 12-17)</option>
            <option value="One Way">Rede One Way (Jovens & Universitários)</option>
            <option value="Padrão">Padrão (Adultos, Famílias e Geral)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A] mb-1.5">
            Categoria do Evento
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as any)}
            className="w-full h-12 px-4 rounded-lg bg-white border border-[#E4E4E7] text-base text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="Acampamento">Acampamento / Retiro</option>
            <option value="Conferência">Conferência</option>
            <option value="Encontro">Encontro Especial</option>
            <option value="Culto especial">Culto Especial</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Datas */}
        <Input
          label="Data de Início"
          required
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />

        <Input
          label="Data de Encerramento (Opcional)"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />

        {/* Vagas e Valor */}
        <Input
          label="Quantidade Total de Vagas"
          required
          type="number"
          min={1}
          value={vagas}
          onChange={(e) => setVagas(Number(e.target.value))}
        />

        <Input
          label="Valor da Inscrição (R$ — Digite 0 para Gratuito)"
          required
          type="number"
          step="0.01"
          min={0}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          helperText={valor === 0 ? '✓ Evento gratuito (sem cobrança)' : undefined}
        />

        {/* Local e Imagem */}
        <Input
          label="Local do Evento"
          value={localNome}
          onChange={(e) => setLocalNome(e.target.value)}
          placeholder="Ex: Sítio das Palmeiras ou Auditório Eira"
        />

        <Input
          label="URL da Imagem do Banner (16:9)"
          value={imagemUrl}
          onChange={(e) => setImagemUrl(e.target.value)}
          placeholder="https://..."
        />

        {/* Descrição */}
        <div className="md:col-span-2">
          <Textarea
            label="Descrição e Instruções do Evento"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreva a proposta, preletores, horários e itens obrigatórios..."
            rows={3}
          />
        </div>
      </div>

      {/* Seletor Dinâmico de Campos via Chips */}
      <div className="space-y-3 pt-4 border-t border-[#E4E4E7]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
            Campos que o participante deve preencher na inscrição
          </label>
          <p className="text-xs text-[#71717A]">
            Clique para ativar ou desativar os campos do formulário para este evento. Se a "Data de Nascimento" estiver ativa, menores de 18 anos serão identificados automaticamente:
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {TODOS_CAMPOS.map((campo) => {
            const isAtivo = camposSelecionados.includes(campo.id);
            const isBase = campo.obrigatorioBase;

            return (
              <button
                key={campo.id}
                type="button"
                disabled={isBase}
                onClick={() => toggleCampo(campo.id)}
                title={campo.desc}
                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isAtivo
                    ? 'bg-black text-[var(--accent,#FACC15)] border border-black shadow-sm'
                    : 'bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7] hover:border-black'
                } ${isBase ? 'opacity-90 cursor-default' : ''}`}
              >
                {isAtivo && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                <span>{campo.label}</span>
                {isBase && <span className="text-[10px] opacity-75">(Fixo)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="pt-6 flex items-center justify-end space-x-3 border-t border-[#E4E4E7]">
        {onCancelar && (
          <Button type="button" variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isSalvando}>
          {eventoInicial ? 'Salvar Alterações' : 'Publicar Evento'}
        </Button>
      </div>
    </form>
  );
};
