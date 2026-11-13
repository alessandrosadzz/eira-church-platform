'use client';

// src/components/admin/ConfiguracaoIgrejaView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAdminStore, TemaWhiteLabel, BordaPerfil, FonteOpcao } from '../../store/adminStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  Church,
  Palette,
  MapPin,
  Clock,
  Share2,
  Save,
  Plus,
  Trash2,
  ShieldAlert,
  Image as ImageIcon,
  Type,
  Maximize2,
  Upload,
  Sun,
  Moon,
  X,
  Users,
  UserCheck,
  Crown,
  HeartHandshake,
  Ticket,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from 'lucide-react';
import {
  buscarInscricoesSupabase,
  carregarInscricoesLocal,
  buscarCelulasSupabase,
  buscarVisitantesSupabase,
} from '../../lib/eventoAdapter';
import { Inscricao } from '../../types/inscricao';

export const ConfiguracaoIgrejaView: React.FC = () => {
  const { sucesso, erro, info } = useToast();
  const {
    usuarioRole,
    setUsuarioRole,
    igrejaConfig,
    setIgrejaConfig,
    temaAtivo,
    setTemaAtivo,
    bordaAtiva,
    setBordaAtiva,
    fonteAtiva,
    setFonteAtiva,
    modoCor,
    setModoCor,
    celulas,
    setCelulas,
    visitantes,
    setVisitantes,
    lideres,
  } = useAdminStore();

  // Estados do Censo de Pessoas Cadastradas
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [carregandoInscricoes, setCarregandoInscricoes] = useState(false);
  const [filtroTipoPessoa, setFiltroTipoPessoa] = useState<
    'todos' | 'lider' | 'membro' | 'visitante' | 'inscrito'
  >('todos');
  const [buscaPessoas, setBuscaPessoas] = useState('');
  const [expandirListaPessoas, setExpandirListaPessoas] = useState(true);
  const [limiteExibicao, setLimiteExibicao] = useState(25);

  const carregarInscricoes = async () => {
    setCarregandoInscricoes(true);
    try {
      const [inscs, cels, viss] = await Promise.all([
        buscarInscricoesSupabase(),
        buscarCelulasSupabase(),
        buscarVisitantesSupabase(),
      ]);
      if (inscs && inscs.length > 0) {
        setInscricoes(inscs);
      } else {
        setInscricoes(carregarInscricoesLocal());
      }
      if (cels && cels.length > 0) setCelulas(cels);
      if (viss && viss.length > 0) setVisitantes(viss);
    } catch {
      setInscricoes(carregarInscricoesLocal());
    } finally {
      setCarregandoInscricoes(false);
    }
  };

  useEffect(() => {
    carregarInscricoes();
  }, []);

  // Lista consolidada de todas as pessoas da igreja
  const listaConsolidada = useMemo(() => {
    const lista: {
      id: string;
      nome: string;
      telefone?: string | null;
      email?: string | null;
      categoria: 'lider' | 'membro' | 'visitante' | 'inscrito';
      categoriaLabel: string;
      origem: string;
      detalhes: string;
      badgeCor: string;
      telefoneResponsavel?: string | null;
      emailResponsavel?: string | null;
      nomeResponsavel?: string | null;
      idade?: number | null;
    }[] = [];

    const nomesLideresVistos = new Set<string>();

    // 1. Líderes de Célula (do cadastro de células)
    celulas.forEach((cel) => {
      if (cel.lider_nome && !nomesLideresVistos.has(cel.lider_nome.toLowerCase().trim())) {
        nomesLideresVistos.add(cel.lider_nome.toLowerCase().trim());
        lista.push({
          id: `cel-lid-${cel.id}`,
          nome: cel.lider_nome,
          telefone: cel.lider_telefone || null,
          categoria: 'lider',
          categoriaLabel: 'Líder de Célula',
          origem: `Célula ${cel.nome} (${cel.rede || 'Geral'})`,
          detalhes: `${cel.dia_semana || 'Semana'} às ${cel.horario || '19h30'} • ${cel.bairro || 'Joinville'}`,
          badgeCor: 'bg-amber-100 text-amber-900 border-amber-300',
        });
      }
    });

    // 1b. Líderes de contas registradas
    lideres.forEach((lid) => {
      if (lid.nome && !nomesLideresVistos.has(lid.nome.toLowerCase().trim())) {
        nomesLideresVistos.add(lid.nome.toLowerCase().trim());
        lista.push({
          id: `lid-conta-${lid.id}`,
          nome: lid.nome,
          telefone: lid.telefone || null,
          email: lid.usuarioOuEmail || null,
          categoria: 'lider',
          categoriaLabel: 'Líder Cadastrado',
          origem: lid.celulaNome
            ? `Célula ${lid.celulaNome} (${lid.rede || 'Geral'})`
            : lid.rede
            ? `Rede ${lid.rede}`
            : 'Liderança Eira Church',
          detalhes: `Usuário: ${lid.usuarioOuEmail}`,
          badgeCor: 'bg-amber-100 text-amber-900 border-amber-300',
        });
      }
    });

    // 2. Membros de Células
    celulas.forEach((cel) => {
      (cel.membros || []).forEach((m) => {
        lista.push({
          id: `membro-${cel.id}-${m.id}`,
          nome: m.nome,
          telefone: m.telefone || null,
          categoria: 'membro',
          categoriaLabel: m.funcao || 'Membro',
          origem: `Célula ${cel.nome}`,
          detalhes: `${m.batizado ? '💧 Batizado' : 'Não batizado'} • ${m.tempo_celula || 'Membro ativo'}`,
          badgeCor: 'bg-blue-100 text-blue-900 border-blue-300',
        });
      });
    });

    // 3. Visitantes (Conexão / Boas-Vindas)
    visitantes.forEach((vis) => {
      lista.push({
        id: `vis-${vis.id}`,
        nome: vis.nome,
        telefone: vis.telefone || null,
        categoria: 'visitante',
        categoriaLabel: 'Visitante (Conexão)',
        origem: vis.culto_origem || 'Culto da Igreja',
        detalhes: `Convidado por: ${vis.quem_convidou || 'Espontâneo'} • Status: ${
          vis.status === 'integrado'
            ? 'Integrado à Célula'
            : vis.status === 'em_contato'
            ? 'Em Acompanhamento'
            : 'Novo Visitante'
        }`,
        badgeCor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      });
    });

    // 4. Inscritos em Eventos
    inscricoes.forEach((insc) => {
      const isMenor = (insc.idade && insc.idade < 18) || (insc.rede_participante === 'Hype');
      lista.push({
        id: `insc-${insc.id}`,
        nome: insc.nome,
        telefone: insc.telefone || null,
        email: insc.email || null,
        categoria: 'inscrito',
        categoriaLabel: isMenor
          ? `Teens / HYPE (${insc.idade ? `${insc.idade}a` : 'Menor'})`
          : insc.rede_participante === 'One Way'
          ? 'Jovens (One Way)'
          : 'Inscrito em Evento',
        origem: insc.evento?.nome || 'Evento Eira Church',
        detalhes: `Código: ${insc.comprovante_hash || 'EIRA'} • ${
          insc.status === 'pago'
            ? 'Confirmado / Pago'
            : insc.status === 'isento'
            ? 'Isento'
            : 'Pré-Inscrição (Pendente)'
        }`,
        telefoneResponsavel: insc.telefone_responsavel || null,
        emailResponsavel: insc.email_responsavel || null,
        nomeResponsavel: insc.nome_responsavel || null,
        idade: insc.idade || null,
        badgeCor: isMenor
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-purple-100 text-purple-900 border-purple-300',
      });
    });

    return lista;
  }, [celulas, lideres, visitantes, inscricoes]);

  // Contadores por Categoria
  const totalLideres = useMemo(
    () => listaConsolidada.filter((p) => p.categoria === 'lider').length,
    [listaConsolidada]
  );
  const totalMembros = useMemo(
    () => listaConsolidada.filter((p) => p.categoria === 'membro').length,
    [listaConsolidada]
  );
  const totalVisitantes = useMemo(
    () => listaConsolidada.filter((p) => p.categoria === 'visitante').length,
    [listaConsolidada]
  );
  const totalInscritos = useMemo(
    () => listaConsolidada.filter((p) => p.categoria === 'inscrito').length,
    [listaConsolidada]
  );
  const totalGeral = listaConsolidada.length;

  // Filtragem e Busca
  const pessoasFiltradas = useMemo(() => {
    return listaConsolidada.filter((p) => {
      if (filtroTipoPessoa !== 'todos' && p.categoria !== filtroTipoPessoa) {
        return false;
      }
      if (buscaPessoas.trim()) {
        const termo = buscaPessoas.toLowerCase();
        const bateNome = p.nome.toLowerCase().includes(termo);
        const bateTel = p.telefone ? p.telefone.includes(termo) : false;
        const bateEmail = p.email ? p.email.toLowerCase().includes(termo) : false;
        const bateOrigem = p.origem.toLowerCase().includes(termo);
        const bateDetalhes = p.detalhes.toLowerCase().includes(termo);
        return bateNome || bateTel || bateEmail || bateOrigem || bateDetalhes;
      }
      return true;
    });
  }, [listaConsolidada, filtroTipoPessoa, buscaPessoas]);

  // Estados locais do formulário de dados da igreja
  const [nome, setNome] = useState(igrejaConfig.nome);
  const [slogan, setSlogan] = useState(igrejaConfig.slogan);
  const [logoUrl, setLogoUrl] = useState(igrejaConfig.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(igrejaConfig.bannerUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(igrejaConfig.faviconUrl || '');

  // Endereço
  const [logradouro, setLogradouro] = useState(igrejaConfig.endereco.logradouro);
  const [bairro, setBairro] = useState(igrejaConfig.endereco.bairro);
  const [cidade, setCidade] = useState(igrejaConfig.endereco.cidade);
  const [cep, setCep] = useState(igrejaConfig.endereco.cep);
  const [mapsUrl, setMapsUrl] = useState(igrejaConfig.endereco.mapsUrl || '');

  // Cultos
  const [cultos, setCultos] = useState(igrejaConfig.cultos);

  // Redes e Contato
  const [telefone, setTelefone] = useState(igrejaConfig.telefone);
  const [whatsapp, setWhatsapp] = useState(igrejaConfig.whatsapp);
  const [instagram, setInstagram] = useState(igrejaConfig.instagram);
  const [facebook, setFacebook] = useState(igrejaConfig.facebook || '');
  const [youtube, setYoutube] = useState(igrejaConfig.youtube || '');
  const [site, setSite] = useState(igrejaConfig.site || '');
  const [email, setEmail] = useState(igrejaConfig.email);

  // Novo culto temporário
  const [novoDia, setNovoDia] = useState('Domingo');
  const [novoHorario, setNovoHorario] = useState('19h00');
  const [novaDescricao, setNovaDescricao] = useState('');

  // Handlers para Upload Direto de Imagem (FileReader para Base64)
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      erro('O arquivo de imagem da logo deve ter no máximo 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);
      sucesso('Upload da logo realizado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      erro('O banner institucional deve ter no máximo 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = rawDataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimized = canvas.toDataURL('image/jpeg', 0.82);
            setBannerUrl(optimized);
          } else {
            setBannerUrl(rawDataUrl);
          }
          sucesso('Banner institucional carregado e otimizado com sucesso!');
        };
        img.onerror = () => {
          setBannerUrl(rawDataUrl);
          sucesso('Upload do banner realizado com sucesso!');
        };
      } else {
        setBannerUrl(rawDataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFavicon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      erro('O arquivo de favicon deve ter no máximo 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFaviconUrl(dataUrl);
      sucesso('Upload do favicon realizado com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  // Verificação de permissão: Pastores e Admins apenas
  const temPermissao = usuarioRole === 'pastor' || usuarioRole === 'admin';

  if (!temPermissao) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white rounded-[var(--radius-box,0.75rem)] border border-[#E4E4E7] shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#0A0A0A]">
          Área Restrita aos Pastores e Administração
        </h3>
        <p className="text-xs text-[#71717A] leading-relaxed">
          Você está navegando como <strong className="text-black uppercase">Líder</strong>. Os dados institucionais, horários de culto, paleta de cores e identidade visual são configurados exclusivamente por pastores e administradores da igreja.
        </p>
        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setUsuarioRole('admin');
              sucesso('Papel alternado para Administrador para fins de teste.');
            }}
          >
            Mudar para Perfil Administrador (Simulação)
          </Button>
        </div>
      </div>
    );
  }

  // Ações de Cultos
  const handleAdicionarCulto = () => {
    if (!novoDia.trim() || !novoHorario.trim()) {
      info('Preencha dia e horário do culto.');
      return;
    }

    const novo = {
      id: `culto-${Date.now()}`,
      dia: novoDia.trim(),
      horario: novoHorario.trim(),
      descricao: novaDescricao.trim() || 'Culto da Igreja',
    };

    setCultos([...cultos, novo]);
    setNovaDescricao('');
    sucesso('Culto adicionado à lista.');
  };

  const handleRemoverCulto = (id: string) => {
    setCultos(cultos.filter((c) => c.id !== id));
  };

  // Salvar tudo
  const handleSalvarTudo = (e: React.FormEvent) => {
    e.preventDefault();

    setIgrejaConfig({
      nome: nome.trim(),
      slogan: slogan.trim(),
      logoUrl: logoUrl.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      faviconUrl: faviconUrl.trim() || undefined,
      endereco: {
        logradouro: logradouro.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        cep: cep.trim(),
        mapsUrl: mapsUrl.trim() || undefined,
      },
      cultos,
      telefone: telefone.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim(),
      facebook: facebook.trim() || undefined,
      youtube: youtube.trim() || undefined,
      site: site.trim() || undefined,
      email: email.trim(),
    });

    sucesso('Configurações da igreja salvas e aplicadas em todo o sistema!');
  };

  const paletas: { id: TemaWhiteLabel; nome: string; cor: string; desc: string }[] = [
    { id: 'eira-signature', nome: 'Eira Signature', cor: '#FACC15', desc: 'Amarelo vibrante original' },
    { id: 'solar-amber', nome: 'Solar Âmbar', cor: '#F59E0B', desc: 'Laranja caloroso e ativo' },
    { id: 'royal-cobalt', nome: 'Royal Cobalto', cor: '#2563EB', desc: 'Azul clássico e institucional' },
    { id: 'emerald-life', nome: 'Emerald Vida', cor: '#10B981', desc: 'Verde esperança e acolhimento' },
    { id: 'monochrome', nome: 'Monochrome', cor: '#18181B', desc: 'Preto puro minimalista' },
  ];

  const opcoesBorda: { id: BordaPerfil; nome: string; desc: string; estilo: string }[] = [
    { id: 'sharp', nome: 'Retas // Sharp', desc: 'Cantos vivos (0px) minimalistas e técnicos', estilo: 'rounded-none' },
    { id: 'balanced', nome: 'Balanceadas', desc: 'Cantos arredondados modernos (8-12px)', estilo: 'rounded-lg' },
    { id: 'rounded', nome: 'Arredondadas', desc: 'Pills suaves e amigáveis (24px)', estilo: 'rounded-2xl' },
  ];

  const opcoesFonte: { id: FonteOpcao; nome: string; estilo: string }[] = [
    { id: 'manrope', nome: 'Manrope (Padrão)', estilo: 'font-sans' },
    { id: 'inter', nome: 'Inter (Alta legibilidade)', estilo: 'font-sans' },
    { id: 'plus-jakarta', nome: 'Plus Jakarta Sans', estilo: 'font-sans' },
    { id: 'outfit', nome: 'Outfit (Moderno)', estilo: 'font-sans' },
    { id: 'dm-sans', nome: 'DM Sans (Neutro)', estilo: 'font-sans' },
    { id: 'poppins', nome: 'Poppins (Amigável)', estilo: 'font-sans' },
  ];

  return (
    <form onSubmit={handleSalvarTudo} className="space-y-8 text-left max-w-5xl mx-auto">
      {/* ==================================================== */}
      {/* CABEÇALHO DA ABA */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
              <Church className="w-5 h-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
              Configuração Institucional da Igreja
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#71717A]">
            Gerencie o White Label, paleta de cores, bordas, fontes, endereço físico e horários de culto exibidos na Home pública.
          </p>
        </div>

        <Button type="submit" variant="primary" size="md">
          <Save className="w-4 h-4 mr-2" />
          <span>Salvar Alterações</span>
        </Button>
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO NOBRE: CENSO DA IGREJA & TOTAL DE PESSOAS CADASTRADAS */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-6">
        {/* Cabeçalho do Censo com Total Geral em Destaque */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F4F5] pb-4">
          <div className="flex items-start space-x-3">
            <span className="p-2.5 rounded-xl bg-black text-[var(--accent,#FACC15)] flex-shrink-0 mt-0.5 shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#0A0A0A]">
                  Total de Pessoas Cadastradas na Igreja
                </h3>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] shadow-xs">
                  {totalGeral} {totalGeral === 1 ? 'pessoa' : 'pessoas no total'}
                </span>
              </div>
              <p className="text-xs text-[#71717A] mt-1">
                Censo geral unificado: líderes de célula, membros, visitantes da acolhida e inscritos em eventos da igreja com filtro por perfil.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              onClick={carregarInscricoes}
              disabled={carregandoInscricoes}
              className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white hover:bg-[#FAFAFA] text-xs font-bold text-[#0A0A0A] flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Atualizar dados do censo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregandoInscricoes ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            <button
              type="button"
              onClick={() => setExpandirListaPessoas(!expandirListaPessoas)}
              className="px-3 py-1.5 rounded-lg border border-[#E4E4E7] bg-white hover:bg-[#FAFAFA] text-xs font-bold text-[#0A0A0A] flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              {expandirListaPessoas ? (
                <>
                  <span>Recolher</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Ver Pessoas</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Cards de Métricas por Categoria (Clicáveis para filtrar) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card Líderes */}
          <button
            type="button"
            onClick={() => setFiltroTipoPessoa('lider')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              filtroTipoPessoa === 'lider'
                ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500 shadow-sm'
                : 'border-[#E4E4E7] hover:border-[#0A0A0A] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-600" />
                Líderes & Pastores
              </span>
              <span className="text-xl font-black text-[#0A0A0A]">{totalLideres}</span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-1.5">
              {totalLideres === 1 ? '1 líder cadastrado' : `${totalLideres} líderes ativos`}
            </p>
          </button>

          {/* Card Membros */}
          <button
            type="button"
            onClick={() => setFiltroTipoPessoa('membro')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              filtroTipoPessoa === 'membro'
                ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500 shadow-sm'
                : 'border-[#E4E4E7] hover:border-[#0A0A0A] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Membros de Células
              </span>
              <span className="text-xl font-black text-[#0A0A0A]">{totalMembros}</span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-1.5">
              {totalMembros === 1 ? '1 membro de célula' : `${totalMembros} membros registrados`}
            </p>
          </button>

          {/* Card Visitantes */}
          <button
            type="button"
            onClick={() => setFiltroTipoPessoa('visitante')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              filtroTipoPessoa === 'visitante'
                ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-sm'
                : 'border-[#E4E4E7] hover:border-[#0A0A0A] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                Visitantes (Conexão)
              </span>
              <span className="text-xl font-black text-[#0A0A0A]">{totalVisitantes}</span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-1.5">
              {totalVisitantes === 1 ? '1 novo visitante' : `${totalVisitantes} pessoas acolhidas`}
            </p>
          </button>

          {/* Card Inscritos em Eventos */}
          <button
            type="button"
            onClick={() => setFiltroTipoPessoa('inscrito')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              filtroTipoPessoa === 'inscrito'
                ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500 shadow-sm'
                : 'border-[#E4E4E7] hover:border-[#0A0A0A] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-purple-600" />
                Inscritos em Eventos
              </span>
              <span className="text-xl font-black text-[#0A0A0A]">{totalInscritos}</span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-1.5">
              {totalInscritos === 1 ? '1 participante' : `${totalInscritos} inscrições / pré-cadastros`}
            </p>
          </button>
        </div>

        {/* Barra de Filtros, Busca e Tabela */}
        {expandirListaPessoas && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Tabs de Filtro de Categoria */}
              <div className="flex flex-wrap gap-1.5 bg-[#F4F4F5] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFiltroTipoPessoa('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipoPessoa === 'todos'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-[#52525B] hover:text-[#0A0A0A]'
                  }`}
                >
                  Todas ({totalGeral})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoPessoa('lider')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipoPessoa === 'lider'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-[#52525B] hover:text-[#0A0A0A]'
                  }`}
                >
                  👑 Líderes ({totalLideres})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoPessoa('membro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipoPessoa === 'membro'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#52525B] hover:text-[#0A0A0A]'
                  }`}
                >
                  👥 Membros ({totalMembros})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoPessoa('visitante')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipoPessoa === 'visitante'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-[#52525B] hover:text-[#0A0A0A]'
                  }`}
                >
                  🤝 Visitantes ({totalVisitantes})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipoPessoa('inscrito')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroTipoPessoa === 'inscrito'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-[#52525B] hover:text-[#0A0A0A]'
                  }`}
                >
                  🎟️ Inscritos ({totalInscritos})
                </button>
              </div>

              {/* Input de Busca */}
              <div className="relative min-w-[240px] flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buscaPessoas}
                  onChange={(e) => setBuscaPessoas(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault();
                  }}
                  placeholder="Buscar por nome, telefone, célula..."
                  className="w-full h-9 pl-9 pr-8 rounded-lg border border-[#E4E4E7] bg-white text-xs text-[#0A0A0A] placeholder-[#A1A1AA] focus:border-black focus:outline-none"
                />
                {buscaPessoas && (
                  <button
                    type="button"
                    onClick={() => setBuscaPessoas('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#0A0A0A] text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Listagem / Tabela de Pessoas */}
            <div className="border border-[#E4E4E7] rounded-xl overflow-hidden bg-white shadow-xs">
              {pessoasFiltradas.length === 0 ? (
                <div className="p-8 text-center text-[#71717A] space-y-2">
                  <Users className="w-8 h-8 mx-auto text-[#A1A1AA] opacity-40" />
                  <p className="text-sm font-bold text-[#0A0A0A]">Nenhuma pessoa encontrada</p>
                  <p className="text-xs">
                    {buscaPessoas
                      ? 'Nenhum resultado corresponde aos termos da pesquisa.'
                      : 'Não há registros nesta categoria no momento.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F4F4F5] max-h-[460px] overflow-y-auto">
                  {pessoasFiltradas.slice(0, limiteExibicao).map((p) => {
                    const numeroLimpo = p.telefone ? p.telefone.replace(/\D/g, '') : '';
                    const linkWhatsApp = numeroLimpo
                      ? `https://wa.me/55${numeroLimpo}`
                      : null;

                    const telRespLimpo = p.telefoneResponsavel
                      ? p.telefoneResponsavel.replace(/\D/g, '')
                      : '';
                    const linkWhatsAppResp = telRespLimpo
                      ? `https://wa.me/55${telRespLimpo}`
                      : null;

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 hover:bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center font-extrabold text-xs text-[#0A0A0A] flex-shrink-0">
                            {p.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-[#0A0A0A] truncate">
                                {p.nome}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${p.badgeCor}`}
                              >
                                {p.categoriaLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                              {p.origem} • <span className="text-[#52525B]">{p.detalhes}</span>
                            </p>
                            {p.telefoneResponsavel && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-[#1E40AF]">
                                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
                                  <ShieldAlert className="w-3 h-3 text-[#2563EB]" />
                                  <span>Resp: {p.telefoneResponsavel}</span>
                                </span>
                                {p.emailResponsavel && (
                                  <span className="text-[#3B82F6] font-mono text-[10px]">
                                    ({p.emailResponsavel})
                                  </span>
                                )}
                                {linkWhatsAppResp && (
                                  <a
                                    href={linkWhatsAppResp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#166534] hover:underline font-bold bg-[#DCFCE7] border border-[#86EFAC] px-1.5 py-0.5 rounded"
                                    title="Chamar pai/mãe no WhatsApp"
                                  >
                                    <MessageCircle className="w-3 h-3 text-[#22C55E]" />
                                    WhatsApp do Pai/Mãe
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                          {p.telefone && (
                            <span className="text-[#52525B] font-mono text-[11px]">
                              {p.telefone}
                            </span>
                          )}
                          {linkWhatsApp && (
                            <a
                              href={linkWhatsApp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-[#E4E4E7] bg-white hover:bg-[#DCFCE7] hover:border-[#86EFAC] text-[#166534] transition-colors"
                              title="Conversar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pessoasFiltradas.length > limiteExibicao && (
                <div className="p-3 bg-[#FAFAFA] border-t border-[#E4E4E7] text-center">
                  <button
                    type="button"
                    onClick={() => setLimiteExibicao((prev) => prev + 30)}
                    className="text-xs font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                  >
                    Exibindo {limiteExibicao} de {pessoasFiltradas.length} pessoas • Carregar mais...
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO 1: IDENTIDADE VISUAL WHITE LABEL & CORES */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
          <Palette className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="font-extrabold text-base text-[#0A0A0A]">
              Identidade Visual & Cores de Destaque
            </h3>
            <p className="text-xs text-[#71717A]">
              Altere a cor de destaque da sua igreja. Todo o sistema se adapta instantaneamente.
            </p>
          </div>
        </div>

        {/* Cores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paletas.map((p) => {
            const isAtivo = temaAtivo === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setTemaAtivo(p.id);
                  sucesso(`Paleta ${p.nome} aplicada!`);
                }}
                className={`p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                  isAtivo
                    ? 'border-black ring-2 ring-black shadow-sm bg-[#FAFAFA]'
                    : 'border-[#E4E4E7] hover:border-black bg-white'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full border border-black/20 shadow-xs flex-shrink-0"
                  style={{ backgroundColor: p.cor }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0A0A0A]">{p.nome}</p>
                  <p className="text-[11px] text-[#71717A] truncate">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Perfis de Bordas */}
        <div className="pt-4 border-t border-[#F4F4F5] space-y-3">
          <div className="flex items-center space-x-2">
            <Maximize2 className="w-4 h-4 text-[#71717A]" />
            <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Estilo de Bordas do Sistema
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {opcoesBorda.map((b) => {
              const isAtivo = bordaAtiva === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBordaAtiva(b.id);
                    sucesso(`Estilo de bordas ${b.nome} aplicado!`);
                  }}
                  className={`p-4 border text-left transition-all cursor-pointer ${b.estilo} ${
                    isAtivo
                      ? 'border-black ring-2 ring-black bg-[#FAFAFA]'
                      : 'border-[#E4E4E7] hover:border-black bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-[#0A0A0A]">{b.nome}</p>
                  <p className="text-[11px] text-[#71717A] mt-1">{b.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opções de Fontes Google */}
        <div className="pt-4 border-t border-[#F4F4F5] space-y-3">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-[#71717A]" />
            <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Tipografia (Google Fonts)
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {opcoesFonte.map((f) => {
              const isAtivo = fonteAtiva === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFonteAtiva(f.id);
                    sucesso(`Fonte ${f.nome} ativada!`);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isAtivo
                      ? 'bg-black text-[var(--accent,#FACC15)] border-black shadow-sm font-bold'
                      : 'bg-[#FAFAFA] text-[#0A0A0A] border-[#E4E4E7] hover:border-black text-xs'
                  }`}
                >
                  <span>{f.nome}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modo Claro e Modo Escuro */}
        <div className="pt-4 border-t border-[#F4F4F5] space-y-3">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-[#71717A]" />
            <h4 className="text-xs font-bold uppercase tracking-tight text-[#0A0A0A]">
              Aparência do Sistema: Modo Claro & Modo Escuro
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => {
                setModoCor('light');
                sucesso('Modo Claro ativado.');
              }}
              className={`p-4 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer ${
                modoCor === 'light'
                  ? 'border-black ring-2 ring-black bg-[#FAFAFA] text-black font-bold shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white text-[#71717A]'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#FEF08A] text-[#854D0E]">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs">Modo Claro</p>
                <span className="text-[10px] text-[#71717A]">Fundo claro minimalista</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setModoCor('dark');
                sucesso('Modo Escuro ativado.');
              }}
              className={`p-4 rounded-xl border flex items-center space-x-3 transition-all cursor-pointer ${
                modoCor === 'dark'
                  ? 'border-black ring-2 ring-black bg-[#18181B] text-white font-bold shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white text-[#71717A]'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#27272A] text-white">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs">Modo Escuro</p>
                <span className="text-[10px] text-[#71717A]">Alto contraste noturno</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO 2: DADOS INSTITUCIONAIS DA IGREJA */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
          <Church className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="font-extrabold text-base text-[#0A0A0A]">
              Dados Oficiais da Igreja
            </h3>
            <p className="text-xs text-[#71717A]">
              Nome, slogan institucional, logo e banner principal da congregação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome da Igreja"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Eira Church"
          />

          <Input
            label="Slogan / Frase de Apresentação"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="Ex: Uma igreja contemporânea em células"
          />

          {/* Logo: URL ou Upload */}
          <div className="space-y-1.5">
            <Input
              label="URL da Logo da Igreja"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://sua-igreja.com/logo.png"
            />
            <div className="flex items-center space-x-2 pt-1">
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] border border-[#E4E4E7] hover:border-black cursor-pointer transition-colors text-[#0A0A0A]">
                <Upload className="w-3.5 h-3.5" />
                <span>Fazer upload da Logo</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="text-xs text-[#DC2626] hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Banner da Capa da Home: URL ou Upload */}
          <div className="space-y-1.5">
            <Input
              label="Banner Principal da Home (Atrás do Título)"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://sua-igreja.com/banner-home.jpg"
              helperText="Exibido na capa inicial atrás de 'Próximos Encontros' com escurecimento automático."
            />
            <div className="flex items-center space-x-2 pt-1">
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] border border-[#E4E4E7] hover:border-black cursor-pointer transition-colors text-[#0A0A0A]">
                <Upload className="w-3.5 h-3.5" />
                <span>Fazer upload do Banner da Home</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleUploadBanner}
                  className="hidden"
                />
              </label>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="text-xs text-[#DC2626] hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Favicon da Aba do Navegador: URL ou Upload */}
          <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-[#F4F4F5]">
            <Input
              label="Favicon da Página (Ícone exibido na aba do navegador)"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://sua-igreja.com/favicon.png ou faça upload abaixo"
            />
            <div className="flex items-center space-x-3 pt-1">
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] border border-[#E4E4E7] hover:border-black cursor-pointer transition-colors text-[#0A0A0A]">
                <Upload className="w-3.5 h-3.5" />
                <span>Fazer upload do Favicon (.png, .ico, .svg)</span>
                <input
                  type="file"
                  accept="image/png, image/x-icon, image/vnd.microsoft.icon, image/svg+xml, image/jpeg"
                  onChange={handleUploadFavicon}
                  className="hidden"
                />
              </label>
              {faviconUrl && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg border border-[#E4E4E7] bg-white p-1 flex items-center justify-center shadow-xs">
                    <img src={faviconUrl} alt="Preview Favicon" className="w-5 h-5 object-contain" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaviconUrl('')}
                    className="text-xs text-[#DC2626] hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] text-[#71717A]">
              Recomendado: imagem quadrada (.png ou .ico), com resolução de 32x32 ou 64x64 pixels.
            </p>
          </div>
        </div>

        {/* Previews rápidos de Logo, Banner e Favicon */}
        {(logoUrl || bannerUrl || faviconUrl) && (
          <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex flex-wrap items-center gap-4">
            {faviconUrl && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#71717A]">Favicon:</span>
                <div className="w-8 h-8 rounded border border-[#D4D4D8] bg-white p-1 flex items-center justify-center shadow-xs">
                  <img src={faviconUrl} alt="Favicon" className="w-5 h-5 object-contain" />
                </div>
              </div>
            )}
            {logoUrl && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase">Preview Logo:</span>
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-10 object-contain rounded bg-white p-1 border border-[#E4E4E7]"
                  onError={() => info('Não foi possível carregar a imagem da logo.')}
                />
              </div>
            )}
            {bannerUrl && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase">Preview Banner:</span>
                <img
                  src={bannerUrl}
                  alt="Banner preview"
                  className="h-12 w-28 object-cover rounded border border-[#E4E4E7]"
                  onError={() => info('Não foi possível carregar a imagem do banner.')}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO 3: ENDEREÇO FÍSICO & GOOGLE MAPS */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
          <MapPin className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="font-extrabold text-base text-[#0A0A0A]">
              Endereço Físico & Localização
            </h3>
            <p className="text-xs text-[#71717A]">
              Exibido no rodapé e painel para guiar visitantes e participantes de eventos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Logradouro e Número"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            placeholder="Ex: Av. Brasil, 4520"
          />

          <Input
            label="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            placeholder="Ex: Centro"
          />

          <Input
            label="Cidade e UF"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex: Cascavel - PR"
          />

          <Input
            label="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Ex: 85810-010"
          />

          <div className="md:col-span-2">
            <Input
              label="Link Direto do Google Maps (Como Chegar)"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
            />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO 4: HORÁRIOS DE CULTO & DIAS DE REUNIÃO */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
          <Clock className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="font-extrabold text-base text-[#0A0A0A]">
              Horários de Culto & Reuniões Semanais
            </h3>
            <p className="text-xs text-[#71717A]">
              Estes horários são exibidos no painel da Home para acolher pessoas novas.
            </p>
          </div>
        </div>

        {/* Lista de cultos configurados */}
        <div className="space-y-2">
          {cultos.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-[#0A0A0A] uppercase">{c.dia}</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-black text-[var(--accent,#FACC15)]">
                    {c.horario}
                  </span>
                </div>
                <p className="text-[#52525B]">{c.descricao}</p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoverCulto(c.id)}
                className="text-[#A1A1AA] hover:text-[#DC2626] p-1.5 rounded transition-colors cursor-pointer"
                title="Remover horário"
                aria-label="Remover culto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Adicionar novo culto */}
        <div className="pt-3 border-t border-[#F4F4F5] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-tight text-[#0A0A0A] mb-1">
              Dia da Semana
            </label>
            <select
              value={novoDia}
              onChange={(e) => setNovoDia(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-white border border-[#E4E4E7] text-xs text-[#0A0A0A]"
            >
              <option value="Domingo">Domingo</option>
              <option value="Segunda-feira">Segunda-feira</option>
              <option value="Terça-feira">Terça-feira</option>
              <option value="Quarta-feira">Quarta-feira</option>
              <option value="Quinta-feira">Quinta-feira</option>
              <option value="Sexta-feira">Sexta-feira</option>
              <option value="Sábado">Sábado</option>
            </select>
          </div>

          <div>
            <Input
              label="Horário"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
              placeholder="19h00"
            />
          </div>

          <div>
            <Input
              label="Descrição do Culto"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Ex: Culto de Jovens"
            />
          </div>

          <div>
            <Button
              type="button"
              variant="dark"
              size="md"
              className="w-full"
              onClick={handleAdicionarCulto}
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Adicionar Culto</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SEÇÃO 5: CANAIS DE CONTATO & REDES SOCIAIS */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
          <Share2 className="w-5 h-5 text-[#0A0A0A]" />
          <div>
            <h3 className="font-extrabold text-base text-[#0A0A0A]">
              Canais Oficiais de Contato & Redes
            </h3>
            <p className="text-xs text-[#71717A]">
              Informações para suporte e atendimento da congregação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="WhatsApp da Secretaria"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(45) 99881-2233"
          />

          <Input
            label="Telefone Fixo da Igreja"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(45) 3038-1122"
          />

          <Input
            label="Instagram Oficial"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@daeirajoinville"
            helperText="Aparece clicável no rodapé e contatos da página inicial."
          />

          <Input
            label="Facebook Oficial da Igreja"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/eirachurch"
            helperText="Link direto para a página do Facebook no rodapé."
          />

          <Input
            label="Canal do YouTube Oficial"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/@eirachurch"
            helperText="Link direto para os cultos e vídeos no YouTube."
          />

          <Input
            label="Website / Portal Oficial"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="https://eirachurch.com.br"
            helperText="Link para o site institucional."
          />

          <div className="md:col-span-2">
            <Input
              label="E-mail de Contato Geral"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contato@eirachurch.com.br"
            />
          </div>
        </div>
      </div>

      {/* Botão Salvar Flutuante ou no Rodapé */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E4E4E7]">
        <Button type="submit" variant="primary" size="lg">
          <Save className="w-4 h-4 mr-2" />
          <span>Salvar Todas as Configurações</span>
        </Button>
      </div>
    </form>
  );
};
