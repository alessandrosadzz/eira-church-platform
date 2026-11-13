'use client';

// src/components/admin/ConfiguracaoIgrejaView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  useAdminStore,
  TemaWhiteLabel,
  BordaPerfil,
  FonteOpcao,
  UsuarioRole,
} from '../../store/adminStore';
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
  Sliders,
  Key,
  Lock,
  CheckCircle2,
  Home,
} from 'lucide-react';
import {
  buscarInscricoesSupabase,
  carregarInscricoesLocal,
  buscarCelulasSupabase,
  buscarVisitantesSupabase,
} from '../../lib/eventoAdapter';
import { Inscricao } from '../../types/inscricao';

export interface PessoaCenso {
  id: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  categoria: 'lider' | 'conexao' | 'membro' | 'visitante' | 'inscrito';
  subRole: UsuarioRole | 'membro' | 'visitante' | 'inscrito';
  categoriaLabel: string;
  origem: string;
  detalhes: string;
  badgeCor: string;
  celulaId?: string;
  celulaNome?: string;
  rede?: string;
  usuarioLogin?: string;
  telefoneResponsavel?: string | null;
  emailResponsavel?: string | null;
  nomeResponsavel?: string | null;
  idade?: number | null;
}

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
    atualizarFuncaoPessoa,
    atualizarStatusVisitante,
  } = useAdminStore();

  // Sub-abas de Navegação dentro das Configurações
  const [subAba, setSubAba] = useState<
    'usuarios' | 'identidade' | 'personalizacao' | 'cultos_contato'
  >('usuarios');

  // Estados do Censo de Pessoas Cadastradas
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [carregandoInscricoes, setCarregandoInscricoes] = useState(false);
  const [filtroTipoPessoa, setFiltroTipoPessoa] = useState<
    'todos' | 'lider_12' | 'lider_celula' | 'pastor_admin' | 'conexao' | 'membro' | 'visitante' | 'inscrito'
  >('todos');
  const [buscaPessoas, setBuscaPessoas] = useState('');
  const [limiteExibicao, setLimiteExibicao] = useState(30);

  // Estado do Modal de Configuração de Função
  const [modalFuncaoAberto, setModalFuncaoAberto] = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<PessoaCenso | null>(null);
  const [novaFuncaoSelecionada, setNovaFuncaoSelecionada] = useState<UsuarioRole | 'membro'>('lider_12');
  const [novoUsuarioAcesso, setNovoUsuarioAcesso] = useState('');
  const [novaSenhaAcesso, setNovaSenhaAcesso] = useState('eira@1212');
  const [novaRedeSelecionada, setNovaRedeSelecionada] = useState('Hype');
  const [novoNomeCelula, setNovoNomeCelula] = useState('');
  const [salvandoFuncao, setSalvandoFuncao] = useState(false);

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

  // Lista consolidada de todas as pessoas da igreja com papéis estritos
  const listaConsolidada = useMemo(() => {
    const lista: PessoaCenso[] = [];
    const nomesLideresVistos = new Set<string>();

    // 1. Líderes de Célula e Líderes de 12 (do cadastro de células)
    celulas.forEach((cel) => {
      let meta: any = {};
      if (cel.anfitriao_nome && cel.anfitriao_nome.startsWith('{')) {
        try {
          meta = JSON.parse(cel.anfitriao_nome);
        } catch {}
      }
      const lidConta = lideres.find(
        (l) => l.nome.trim().toLowerCase() === cel.lider_nome.trim().toLowerCase()
      );
      const roleEfetivo: UsuarioRole =
        lidConta?.role || (meta.role as UsuarioRole) || (cel.role as UsuarioRole) || 'lider_celula';

      if (cel.lider_nome && !nomesLideresVistos.has(cel.lider_nome.toLowerCase().trim())) {
        nomesLideresVistos.add(cel.lider_nome.toLowerCase().trim());
        const is12 = roleEfetivo === 'lider_12';
        const isPastor = roleEfetivo === 'pastor';
        const isAdmin = roleEfetivo === 'admin';
        const isConexao =
          roleEfetivo === 'conexao' ||
          lidConta?.role === 'conexao' ||
          (meta.role as string) === 'conexao' ||
          (cel.role as string) === 'conexao' ||
          cel.nome?.toLowerCase().trim() === 'célula conexão' ||
          cel.nome?.toLowerCase().trim() === 'conexão';

        lista.push({
          id: `cel-lid-${cel.id}`,
          nome: cel.lider_nome,
          telefone: cel.lider_telefone || null,
          categoria: isConexao ? 'conexao' : 'lider',
          subRole: isConexao ? 'conexao' : roleEfetivo,
          categoriaLabel: is12
            ? '👑 Líder de 12 (Rede)'
            : isPastor
            ? '✝️ Pastor'
            : isAdmin
            ? '🛡️ Administrador'
            : isConexao
            ? '🤝 Equipe Conexão'
            : '🏠 Líder de Célula',
          origem: isConexao
            ? 'Equipe Conexão // Acolhimento & Visitantes'
            : `Célula ${cel.nome} (${cel.rede || 'Geral'})`,
          detalhes: isConexao
            ? `Usuário: ${lidConta?.usuarioOuEmail || 'conexao'}`
            : `${cel.dia_semana || 'Semana'} às ${cel.horario || '19h30'} • ${cel.bairro || 'Joinville'}`,
          badgeCor: is12
            ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
            : isPastor
            ? 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold'
            : isAdmin
            ? 'bg-zinc-100 text-zinc-950 border-zinc-300 font-extrabold'
            : isConexao
            ? 'bg-sky-100 text-sky-950 border-sky-300 font-extrabold'
            : 'bg-amber-50 text-amber-900 border-amber-200',
          celulaId: isConexao ? undefined : cel.id,
          celulaNome: isConexao ? undefined : cel.nome,
          rede: cel.rede,
          usuarioLogin: lidConta?.usuarioOuEmail || meta.usuario || undefined,
        });
      }
    });

    // 1b. Líderes de contas registradas
    lideres.forEach((lid) => {
      if (lid.nome && !nomesLideresVistos.has(lid.nome.toLowerCase().trim())) {
        nomesLideresVistos.add(lid.nome.toLowerCase().trim());
        const roleEfetivo: UsuarioRole = lid.role || 'lider_celula';
        const is12 = roleEfetivo === 'lider_12';
        const isPastor = roleEfetivo === 'pastor';
        const isAdmin = roleEfetivo === 'admin';
        const isConexao =
          roleEfetivo === 'conexao' ||
          lid.role === 'conexao' ||
          lid.celulaNome === 'Célula Conexão' ||
          lid.celulaNome === 'Conexão' ||
          (lid.rede === 'Conexão' && roleEfetivo !== 'pastor' && roleEfetivo !== 'admin');

        lista.push({
          id: `lid-conta-${lid.id}`,
          nome: lid.nome,
          telefone: lid.telefone || null,
          email: lid.usuarioOuEmail || null,
          categoria: isConexao ? 'conexao' : 'lider',
          subRole: isConexao ? 'conexao' : roleEfetivo,
          categoriaLabel: is12
            ? '👑 Líder de 12 (Rede)'
            : isPastor
            ? '✝️ Pastor'
            : isAdmin
            ? '🛡️ Administrador'
            : isConexao
            ? '🤝 Equipe Conexão'
            : '🏠 Líder de Célula',
          origem: isConexao
            ? 'Equipe Conexão // Acolhimento & Visitantes'
            : lid.celulaNome
            ? `Célula ${lid.celulaNome} (${lid.rede || 'Geral'})`
            : lid.rede
            ? `Rede ${lid.rede}`
            : 'Liderança Eira Church',
          detalhes: isConexao
            ? `Usuário: ${lid.usuarioOuEmail}`
            : `Usuário: ${lid.usuarioOuEmail}`,
          badgeCor: is12
            ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
            : isPastor
            ? 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold'
            : isAdmin
            ? 'bg-zinc-100 text-zinc-950 border-zinc-300 font-extrabold'
            : isConexao
            ? 'bg-sky-100 text-sky-950 border-sky-300 font-extrabold'
            : 'bg-amber-50 text-amber-900 border-amber-200',
          celulaNome: isConexao ? undefined : lid.celulaNome,
          rede: lid.rede,
          usuarioLogin: lid.usuarioOuEmail,
        });
      }
    });

    // 2. Membros de Células
    celulas.forEach((cel) => {
      (cel.membros || []).forEach((m) => {
        if (nomesLideresVistos.has(m.nome.toLowerCase().trim())) return;

        lista.push({
          id: `membro-${cel.id}-${m.id}`,
          nome: m.nome,
          telefone: m.telefone || null,
          categoria: 'membro',
          subRole: 'membro',
          categoriaLabel: m.funcao || 'Membro de Célula',
          origem: `Célula ${cel.nome} (${cel.rede || 'Geral'})`,
          detalhes: `${m.batizado ? '💧 Batizado' : 'Não batizado'} • ${m.tempo_celula || 'Membro ativo'}`,
          badgeCor: 'bg-blue-100 text-blue-900 border-blue-300',
          celulaId: cel.id,
          celulaNome: cel.nome,
          rede: cel.rede,
        });
      });
    });

    // 3. Visitantes (Conexão / Boas-Vindas)
    visitantes.forEach((vis) => {
      if (nomesLideresVistos.has(vis.nome.toLowerCase().trim())) return;

      lista.push({
        id: `vis-${vis.id}`,
        nome: vis.nome,
        telefone: vis.telefone || null,
        categoria: 'visitante',
        subRole: 'visitante',
        categoriaLabel: '🤝 Visitante (Conexão)',
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
      if (nomesLideresVistos.has(insc.nome.toLowerCase().trim())) return;

      const isMenor = (insc.idade && insc.idade < 18) || (insc.rede_participante === 'Hype');
      lista.push({
        id: `insc-${insc.id}`,
        nome: insc.nome,
        telefone: insc.telefone || null,
        email: insc.email || null,
        categoria: 'inscrito',
        subRole: 'inscrito',
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
  const totalLideres12 = useMemo(
    () => listaConsolidada.filter((p) => p.subRole === 'lider_12').length,
    [listaConsolidada]
  );
  const totalLideresCelula = useMemo(
    () => listaConsolidada.filter((p) => p.subRole === 'lider_celula').length,
    [listaConsolidada]
  );
  const totalPastoresAdmin = useMemo(
    () => listaConsolidada.filter((p) => p.subRole === 'pastor' || p.subRole === 'admin').length,
    [listaConsolidada]
  );
  const totalConexao = useMemo(
    () => listaConsolidada.filter((p) => p.subRole === 'conexao').length,
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
      if (filtroTipoPessoa === 'lider_12' && p.subRole !== 'lider_12') return false;
      if (filtroTipoPessoa === 'lider_celula' && p.subRole !== 'lider_celula') return false;
      if (filtroTipoPessoa === 'conexao' && p.subRole !== 'conexao') return false;
      if (filtroTipoPessoa === 'pastor_admin' && p.subRole !== 'pastor' && p.subRole !== 'admin')
        return false;
      if (filtroTipoPessoa === 'membro' && p.categoria !== 'membro') return false;
      if (filtroTipoPessoa === 'visitante' && p.categoria !== 'visitante') return false;
      if (filtroTipoPessoa === 'inscrito' && p.categoria !== 'inscrito') return false;

      if (buscaPessoas.trim()) {
        const termo = buscaPessoas.toLowerCase();
        const bateNome = p.nome.toLowerCase().includes(termo);
        const bateTel = p.telefone ? p.telefone.includes(termo) : false;
        const bateEmail = p.email ? p.email.toLowerCase().includes(termo) : false;
        const bateOrigem = p.origem.toLowerCase().includes(termo);
        const bateDetalhes = p.detalhes.toLowerCase().includes(termo);
        const bateResp = p.nomeResponsavel ? p.nomeResponsavel.toLowerCase().includes(termo) : false;
        const bateTelResp = p.telefoneResponsavel ? p.telefoneResponsavel.includes(termo) : false;
        return bateNome || bateTel || bateEmail || bateOrigem || bateDetalhes || bateResp || bateTelResp;
      }
      return true;
    });
  }, [listaConsolidada, filtroTipoPessoa, buscaPessoas]);

  // Abertura do Modal de Alteração de Função
  const handleAbrirModalFuncao = (p: PessoaCenso) => {
    setPessoaSelecionada(p);
    const funcaoAtual: UsuarioRole | 'membro' =
      p.subRole === 'visitante' || p.subRole === 'inscrito'
        ? 'membro'
        : (p.subRole as UsuarioRole | 'membro');
    setNovaFuncaoSelecionada(funcaoAtual);

    const loginSugerido = p.email && p.email.includes('@')
      ? p.email.split('@')[0].toLowerCase()
      : p.nome
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '.');

    setNovoUsuarioAcesso(p.usuarioLogin || loginSugerido);
    setNovaSenhaAcesso('eira@1212');
    setNovaRedeSelecionada(p.rede || 'Hype');
    setNovoNomeCelula(p.celulaNome || `Célula ${p.nome.split(' ')[0]}`);
    setModalFuncaoAberto(true);
  };

  const handleSalvarFuncao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pessoaSelecionada) return;

    setSalvandoFuncao(true);
    try {
      await atualizarFuncaoPessoa({
        pessoaNome: pessoaSelecionada.nome,
        telefone: pessoaSelecionada.telefone,
        email: pessoaSelecionada.email,
        novaFuncao: novaFuncaoSelecionada,
        celulaId: pessoaSelecionada.celulaId,
        rede: novaFuncaoSelecionada === 'conexao' ? 'Conexão' : novaRedeSelecionada,
        celulaNome: novaFuncaoSelecionada === 'lider_celula' ? novoNomeCelula.trim() : undefined,
        novoUsuario: novoUsuarioAcesso,
        novaSenha: novaSenhaAcesso,
      });

      // Se era visitante e foi promovido ou integrado
      if (pessoaSelecionada.id.startsWith('vis-') && novaFuncaoSelecionada !== 'membro') {
        const visId = pessoaSelecionada.id.replace('vis-', '');
        atualizarStatusVisitante(visId, 'integrado');
      }

      const roleNome =
        novaFuncaoSelecionada === 'lider_12'
          ? 'Líder de 12 (Rede)'
          : novaFuncaoSelecionada === 'lider_celula'
          ? 'Líder de Célula'
          : novaFuncaoSelecionada === 'conexao'
          ? 'Equipe Conexão'
          : novaFuncaoSelecionada === 'pastor'
          ? 'Pastor da Igreja'
          : novaFuncaoSelecionada === 'admin'
          ? 'Administrador Geral'
          : 'Membro';

      sucesso(`Função de ${pessoaSelecionada.nome} atualizada para "${roleNome}" com sucesso!`);
      setModalFuncaoAberto(false);
      setPessoaSelecionada(null);
      await carregarInscricoes();
    } catch {
      erro('Não foi possível salvar a alteração de função ministerial.');
    } finally {
      setSalvandoFuncao(false);
    }
  };

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

  // Handlers para Upload Direto de Imagem
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
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* ==================================================== */}
      {/* CABEÇALHO DA ABA COM SUB-NAVEGAÇÃO */}
      {/* ==================================================== */}
      <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)]">
                <Church className="w-5 h-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0A0A0A]">
                Configuração Geral da Igreja & Usuários
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#71717A]">
              Painel institucional exclusivo para Pastores e Administradores: gerencie funções ministeriais de cada pessoa cadastrada, White Label, horários e canais.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSalvarTudo}
            className="flex-shrink-0"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Salvar Alterações</span>
          </Button>
        </div>

        {/* Sub-Abas de Navegação */}
        <div className="flex border-b border-[#E4E4E7] overflow-x-auto no-scrollbar gap-2 pt-2">
          <button
            type="button"
            onClick={() => setSubAba('usuarios')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              subAba === 'usuarios'
                ? 'border-black text-[#0A0A0A] bg-[#FAFAFA]'
                : 'border-transparent text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>Usuários & Funções</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-black text-[var(--accent,#FACC15)] font-mono font-black">
              {totalGeral}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubAba('identidade')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              subAba === 'identidade'
                ? 'border-black text-[#0A0A0A] bg-[#FAFAFA]'
                : 'border-transparent text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#71717A]" />
            <span>Identidade & Banner Hero</span>
          </button>

          <button
            type="button"
            onClick={() => setSubAba('personalizacao')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              subAba === 'personalizacao'
                ? 'border-black text-[#0A0A0A] bg-[#FAFAFA]'
                : 'border-transparent text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
            }`}
          >
            <Palette className="w-4 h-4 text-[#71717A]" />
            <span>White Label & Cores</span>
          </button>

          <button
            type="button"
            onClick={() => setSubAba('cultos_contato')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              subAba === 'cultos_contato'
                ? 'border-black text-[#0A0A0A] bg-[#FAFAFA]'
                : 'border-transparent text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
            }`}
          >
            <Clock className="w-4 h-4 text-[#71717A]" />
            <span>Cultos, Endereço & Redes</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SUB-ABA 1: GESTÃO DE USUÁRIOS & FUNÇÕES DA IGREJA */}
      {/* ==================================================== */}
      {subAba === 'usuarios' && (
        <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-6 animate-fadeIn">
          {/* Cabeçalho do Censo com Total Geral */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F4F5] pb-4">
            <div className="flex items-start space-x-3">
              <span className="p-2.5 rounded-xl bg-black text-[var(--accent,#FACC15)] flex-shrink-0 mt-0.5 shadow-xs">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold text-lg text-[#0A0A0A]">
                    Usuários Cadastrados & Gestão de Funções
                  </h3>
                  <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[var(--accent,#FACC15)] text-[var(--accent-text,#000000)] shadow-xs">
                    {totalGeral} pessoas no censo
                  </span>
                </div>
                <p className="text-xs text-[#71717A] mt-1">
                  Pesquise qualquer pessoa da congregação e altere ou promova sua função para Líder de 12 (Rede), Líder de Célula, Pastor, Administrador ou Membro.
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
            </div>
          </div>

          {/* Cards de Métricas por Categoria (Clicáveis para filtrar) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {/* Card Líderes de 12 */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'lider_12' ? 'todos' : 'lider_12')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'lider_12'
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalLideres12}</span>
              </div>
              <p className="text-xs font-bold text-amber-950 mt-1 truncate">Líderes de 12</p>
              <p className="text-[10px] text-[#71717A]">Supervisores</p>
            </button>

            {/* Card Líderes de Célula */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'lider_celula' ? 'todos' : 'lider_celula')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'lider_celula'
                  ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Home className="w-4 h-4 text-amber-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalLideresCelula}</span>
              </div>
              <p className="text-xs font-bold text-amber-950 mt-1 truncate">Líderes de Célula</p>
              <p className="text-[10px] text-[#71717A]">Grupos ativos</p>
            </button>

            {/* Card Pastores & ADM */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'pastor_admin' ? 'todos' : 'pastor_admin')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'pastor_admin'
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Church className="w-4 h-4 text-purple-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalPastoresAdmin}</span>
              </div>
              <p className="text-xs font-bold text-purple-950 mt-1 truncate">Pastores & ADM</p>
              <p className="text-[10px] text-[#71717A]">Diretoria</p>
            </button>

            {/* Card Equipe Conexão */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'conexao' ? 'todos' : 'conexao')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'conexao'
                  ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <HeartHandshake className="w-4 h-4 text-sky-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalConexao}</span>
              </div>
              <p className="text-xs font-bold text-sky-950 mt-1 truncate">Equipe Conexão</p>
              <p className="text-[10px] text-[#71717A]">Acolhimento</p>
            </button>

            {/* Card Membros */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'membro' ? 'todos' : 'membro')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'membro'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalMembros}</span>
              </div>
              <p className="text-xs font-bold text-blue-950 mt-1 truncate">Membros</p>
              <p className="text-[10px] text-[#71717A]">Em células</p>
            </button>

            {/* Card Visitantes */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'visitante' ? 'todos' : 'visitante')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'visitante'
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalVisitantes}</span>
              </div>
              <p className="text-xs font-bold text-emerald-950 mt-1 truncate">Visitantes</p>
              <p className="text-[10px] text-[#71717A]">Conexão</p>
            </button>

            {/* Card Inscritos */}
            <button
              type="button"
              onClick={() => setFiltroTipoPessoa(filtroTipoPessoa === 'inscrito' ? 'todos' : 'inscrito')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                filtroTipoPessoa === 'inscrito'
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-black bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Ticket className="w-4 h-4 text-purple-600" />
                <span className="text-lg font-black text-[#0A0A0A]">{totalInscritos}</span>
              </div>
              <p className="text-xs font-bold text-purple-950 mt-1 truncate">Inscritos</p>
              <p className="text-[10px] text-[#71717A]">Eventos</p>
            </button>
          </div>

          {/* Barra de Pesquisa e Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                value={buscaPessoas}
                onChange={(e) => setBuscaPessoas(e.target.value)}
                placeholder="Pesquisar pessoa por nome, telefone, e-mail, célula, bairro ou responsável..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs text-[#0A0A0A] placeholder-[#71717A] focus:outline-hidden focus:border-black focus:bg-white transition-all"
              />
              {buscaPessoas && (
                <button
                  type="button"
                  onClick={() => setBuscaPessoas('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filtros em Pills Rápidos */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'todos'
                    ? 'bg-black text-[var(--accent,#FACC15)] shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                Todos ({totalGeral})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('lider_12')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'lider_12'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                👑 Líderes de 12 ({totalLideres12})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('lider_celula')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'lider_celula'
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                🏠 Líderes de Célula ({totalLideresCelula})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('pastor_admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'pastor_admin'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                ✝️ Pastores & ADM ({totalPastoresAdmin})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('conexao')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'conexao'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                🤝 Conexão ({totalConexao})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('membro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'membro'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                👥 Membros ({totalMembros})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipoPessoa('visitante')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filtroTipoPessoa === 'visitante'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                }`}
              >
                🤝 Visitantes ({totalVisitantes})
              </button>
            </div>
          </div>

          {/* Listagem / Tabela de Pessoas com Botão de Alterar Função */}
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
              <div className="divide-y divide-[#F4F4F5] max-h-[520px] overflow-y-auto">
                {pessoasFiltradas.slice(0, limiteExibicao).map((p) => {
                  const numeroLimpo = p.telefone ? p.telefone.replace(/\D/g, '') : '';
                  const linkWhatsApp = numeroLimpo ? `https://wa.me/55${numeroLimpo}` : null;

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
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-[#0A0A0A] truncate">
                              {p.nome}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] ${p.badgeCor}`}
                            >
                              {p.categoriaLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                            {p.origem} • <span className="text-[#52525B]">{p.detalhes}</span>
                          </p>
                          {p.telefoneResponsavel && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[#1E40AF]">
                              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
                                <ShieldAlert className="w-3 h-3 text-[#2563EB]" />
                                <span>Resp: {p.telefoneResponsavel}</span>
                              </span>
                              {linkWhatsAppResp && (
                                <a
                                  href={linkWhatsAppResp}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#166534] hover:underline font-bold bg-[#DCFCE7] border border-[#86EFAC] px-1.5 py-0.5 rounded"
                                  title="Chamar pai/mãe no WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3 text-[#22C55E]" />
                                  WhatsApp Pai/Mãe
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações da Linha: Alterar Função e Contato WhatsApp */}
                      <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                        {p.telefone && (
                          <span className="text-[#52525B] font-mono text-[11px] hidden md:inline">
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

                        {/* Botão de Alterar Função (Exclusivo Pastores e Admins) */}
                        <button
                          type="button"
                          onClick={() => handleAbrirModalFuncao(p)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E4E4E7] bg-white hover:bg-black hover:text-[var(--accent,#FACC15)] hover:border-black text-xs font-bold text-[#0A0A0A] flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                          title={`Configurar função ministerial de ${p.nome}`}
                        >
                          <Sliders className="w-3.5 h-3.5 text-amber-600" />
                          <span>Alterar Função</span>
                        </button>
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

      {/* ==================================================== */}
      {/* SUB-ABA 2: IDENTIDADE & BANNER HERO */}
      {/* ==================================================== */}
      {subAba === 'identidade' && (
        <form onSubmit={handleSalvarTudo} className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
            <ImageIcon className="w-5 h-5 text-[#0A0A0A]" />
            <div>
              <h3 className="font-extrabold text-base text-[#0A0A0A]">
                Identidade Institucional & Arte do Banner da Igreja
              </h3>
              <p className="text-xs text-[#71717A]">
                Configure o nome, slogan e faça upload do banner principal que aparece escurecido e desfocado atrás do texto na Home pública.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome da Igreja"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Eira Church"
              required
            />

            <Input
              label="Slogan / Lema Institucional"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ex: Uma igreja viva que ama..."
              required
            />
          </div>

          {/* Upload do Banner Institucional com Arte e Efeito Escuro/Desfoque */}
          <div className="p-5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-[#0A0A0A]">
                  Arte do Banner Hero da Igreja
                </h4>
                <p className="text-xs text-[#71717A]">
                  Esta imagem é exibida no topo da página inicial com filtro cinematográfico escuro e desfoque suave para garantir alto contraste do texto.
                </p>
              </div>
              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
                >
                  Remover Banner
                </button>
              )}
            </div>

            {bannerUrl ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[#27272A] bg-black">
                <img
                  src={bannerUrl}
                  alt="Banner Institucional"
                  className="w-full h-full object-cover filter blur-[2px] brightness-[0.38] contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[var(--accent,#FACC15)] text-black">
                    PRÉ-VISUALIZAÇÃO HERO DA HOME
                  </span>
                  <h4 className="text-xl font-extrabold mt-1">{nome || 'Eira Church'}</h4>
                  <p className="text-xs text-white/80 line-clamp-1">{slogan || 'Uma igreja viva que ama...'}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#E4E4E7] rounded-lg p-6 text-center space-y-2 bg-white">
                <ImageIcon className="w-8 h-8 text-[#A1A1AA] mx-auto" />
                <p className="text-xs text-[#71717A]">Nenhum banner personalizado carregado.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5">
                Fazer Upload de Novo Banner (JPG/PNG até 8MB)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadBanner}
                className="text-xs text-[#71717A] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-[var(--accent,#FACC15)] hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          {/* Upload de Logotipo e Favicon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-3">
              <label className="block text-xs font-bold text-[#0A0A0A]">Logotipo Principal</label>
              {logoUrl ? (
                <div className="w-20 h-20 rounded-lg border border-[#E4E4E7] bg-white p-2 flex items-center justify-center">
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-lg border border-[#E4E4E7] bg-white flex items-center justify-center text-xs text-[#A1A1AA]">
                  Sem logo
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadLogo}
                className="text-xs text-[#71717A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-[var(--accent,#FACC15)] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-3">
              <label className="block text-xs font-bold text-[#0A0A0A]">Favicon da Aba do Navegador</label>
              {faviconUrl ? (
                <div className="w-12 h-12 rounded-lg border border-[#E4E4E7] bg-white p-2 flex items-center justify-center">
                  <img src={faviconUrl} alt="Favicon" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-[#E4E4E7] bg-white flex items-center justify-center text-xs text-[#A1A1AA]">
                  Padrão
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFavicon}
                className="text-xs text-[#71717A] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-[var(--accent,#FACC15)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-2" />
              <span>Salvar Dados Institucionais</span>
            </Button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* SUB-ABA 3: WHITE LABEL, CORES & FONTES */}
      {/* ==================================================== */}
      {subAba === 'personalizacao' && (
        <div className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-8 animate-fadeIn">
          {/* Cores White Label */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
              <Palette className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Paleta de Cores White Label
                </h3>
                <p className="text-xs text-[#71717A]">
                  Selecione a cor de destaque da sua igreja. O sistema recalcula contrastes automaticamente.
                </p>
              </div>
            </div>

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
                    className={`p-3.5 rounded-xl border flex items-center space-x-3 text-left transition-all cursor-pointer ${
                      isAtivo
                        ? 'border-black ring-2 ring-black bg-[#FAFAFA] shadow-xs'
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
          </div>

          {/* Bordas e Cantos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
              <Maximize2 className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Estilo de Bordas & Cantos
                </h3>
                <p className="text-xs text-[#71717A]">
                  Ajusta o raio de curvatura de todos os botões, cards e modais.
                </p>
              </div>
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

          {/* Tipografia */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
              <Type className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Tipografia Institucional
                </h3>
                <p className="text-xs text-[#71717A]">
                  Família tipográfica oficial aplicada em títulos, botões e textos.
                </p>
              </div>
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

          {/* Modo Claro / Escuro */}
          <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0A0A0A]">Modo de Contraste da Interface</p>
              <p className="text-[11px] text-[#71717A]">Alterne entre o tema Claro e o tema Escuro</p>
            </div>
            <button
              type="button"
              onClick={() => setModoCor(modoCor === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2 rounded-lg bg-black text-[var(--accent,#FACC15)] font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              {modoCor === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{modoCor === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-ABA 4: CULTOS, ENDEREÇO & REDES SOCIAIS */}
      {/* ==================================================== */}
      {subAba === 'cultos_contato' && (
        <form onSubmit={handleSalvarTudo} className="p-6 rounded-[var(--radius-box,0.75rem)] bg-white border border-[#E4E4E7] shadow-sm space-y-8 animate-fadeIn">
          {/* Redes Sociais com links clicáveis */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
              <Share2 className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Redes Sociais Oficiais (Clicáveis no Rodapé da Home)
                </h3>
                <p className="text-xs text-[#71717A]">
                  Links configurados aqui aparecem no rodapé e canal institucional de acolhimento.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Instagram Oficial"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@daeirajoinville"
                helperText="Link direto: https://instagram.com/daeirajoinville"
              />

              <Input
                label="Facebook Oficial da Igreja"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/eirachurch"
                helperText="Página do Facebook no rodapé."
              />

              <Input
                label="Canal do YouTube Oficial"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/@eirachurch"
                helperText="Link para transmissões e vídeos."
              />

              <Input
                label="Website / Portal Oficial"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="https://eirachurch.com.br"
                helperText="Página web institucional."
              />

              <Input
                label="WhatsApp da Secretaria"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(47) 99881-2233"
              />

              <Input
                label="E-mail de Contato Geral"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@eirachurch.com.br"
              />
            </div>
          </div>

          {/* Endereço Físico */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#F4F4F5] pb-3">
              <MapPin className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <h3 className="font-extrabold text-base text-[#0A0A0A]">
                  Endereço & Localização da Sede
                </h3>
                <p className="text-xs text-[#71717A]">
                  Localização exibida nos cards de eventos e cultos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Logradouro e Número"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Ex: Rua Dr. João Colin, 1234"
              />

              <Input
                label="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: América"
              />

              <Input
                label="Cidade e Estado"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex: Joinville - SC"
              />

              <Input
                label="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="Ex: 89204-001"
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

          {/* Horários de Culto */}
          <div className="space-y-4">
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
                  placeholder="Ex: Culto da Família"
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

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md">
              <Save className="w-4 h-4 mr-2" />
              <span>Salvar Horários & Contatos</span>
            </Button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* MODAL DE CONFIGURAÇÃO DE FUNÇÃO MINISTERIAL */}
      {/* ==================================================== */}
      {modalFuncaoAberto && pessoaSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-2xl max-w-xl w-full p-6 space-y-6 text-left relative my-8">
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => {
                setModalFuncaoAberto(false);
                setPessoaSelecionada(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#71717A] hover:text-black hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-black text-[var(--accent,#FACC15)]">
                  <Sliders className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-black tracking-tight text-[#0A0A0A]">
                  Configurar Função Ministerial
                </h3>
              </div>
              <p className="text-xs text-[#71717A]">
                Defina o papel de liderança, acesso ao painel e permissões para esta pessoa na igreja.
              </p>
            </div>

            {/* Card da Pessoa Selecionada */}
            <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-black text-[var(--accent,#FACC15)] flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                {pessoaSelecionada.nome.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-[#0A0A0A] truncate">
                    {pessoaSelecionada.nome}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] ${pessoaSelecionada.badgeCor}`}>
                    Atual: {pessoaSelecionada.categoriaLabel}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] truncate mt-0.5">
                  {pessoaSelecionada.origem} • {pessoaSelecionada.telefone || 'Sem telefone'}
                </p>
              </div>
            </div>

            {/* Formulário de Seleção da Nova Função */}
            <form onSubmit={handleSalvarFuncao} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-tight text-[#0A0A0A] mb-2">
                  Selecione a Nova Função
                </label>

                <div className="space-y-2.5">
                  {/* Opção 1: Líder de 12 // Líder de Rede */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'lider_12'
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="lider_12"
                      checked={novaFuncaoSelecionada === 'lider_12'}
                      onChange={() => setNovaFuncaoSelecionada('lider_12')}
                      className="mt-1 accent-black"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Líder de 12 // Líder de Rede
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-200 text-amber-950">
                          Discipulador
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Supervisiona as células da sua rede, gera links exclusivos de convite para novos líderes e líderes de 12, e tem visão geral de relatórios e conexões.
                      </p>
                    </div>
                  </label>

                  {/* Opção 2: Líder de Célula */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'lider_celula'
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="lider_celula"
                      checked={novaFuncaoSelecionada === 'lider_celula'}
                      onChange={() => setNovaFuncaoSelecionada('lider_celula')}
                      className="mt-1 accent-black"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Líder de Célula
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900">
                          Liderança Local
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Responsável direto pela sua célula. Atualiza informações do grupo, gerencia membros e batismos, e acolhe pessoas novas do seu bairro.
                      </p>
                    </div>
                  </label>

                  {/* Opção 3: Equipe Conexão // Acolhimento */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'conexao'
                        ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="conexao"
                      checked={novaFuncaoSelecionada === 'conexao'}
                      onChange={() => setNovaFuncaoSelecionada('conexao')}
                      className="mt-1 accent-sky-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <HeartHandshake className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Equipe Conexão
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-950">
                          Acolhimento & Visitantes
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Acesso exclusivo ao módulo Conexão: compartilhar link da recepção, cadastrar pessoas novas no culto, atualizar status de acolhimento e buscar visitantes.
                      </p>
                    </div>
                  </label>

                  {/* Opção 3: Pastor da Igreja */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'pastor'
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="pastor"
                      checked={novaFuncaoSelecionada === 'pastor'}
                      onChange={() => setNovaFuncaoSelecionada('pastor')}
                      className="mt-1 accent-purple-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Church className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Pastor da Igreja
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-200 text-purple-950">
                          Corpo Pastoral
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Acesso institucional completo: criação e gestão de eventos, relatórios de finanças, censo geral de membros e configuração de lideranças.
                      </p>
                    </div>
                  </label>

                  {/* Opção 4: Administrador Geral */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'admin'
                        ? 'border-zinc-800 bg-zinc-50 ring-2 ring-zinc-800 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="admin"
                      checked={novaFuncaoSelecionada === 'admin'}
                      onChange={() => setNovaFuncaoSelecionada('admin')}
                      className="mt-1 accent-black"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <ShieldAlert className="w-4 h-4 text-zinc-900 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Administrador Geral
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-zinc-200 text-zinc-900">
                          Acesso Total
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Controle total da plataforma: White Label, identidade visual, gestão de permissões, finanças e configurações avançadas.
                      </p>
                    </div>
                  </label>

                  {/* Opção 5: Membro da Igreja */}
                  <label
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      novaFuncaoSelecionada === 'membro'
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500 shadow-xs'
                        : 'border-[#E4E4E7] hover:border-black bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="funcao"
                      value="membro"
                      checked={novaFuncaoSelecionada === 'membro'}
                      onChange={() => setNovaFuncaoSelecionada('membro')}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-black text-[#0A0A0A]">
                          Membro da Igreja
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-900">
                          Membro
                        </span>
                      </div>
                      <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
                        Participa das células e cultos da congregação. Não possui acesso de liderança ou gestão administrativa no sistema.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Campos condicionais para papéis de liderança */}
              {novaFuncaoSelecionada !== 'membro' && (
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-tight text-[#0A0A0A] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    <span>Credenciais de Acesso & Rede</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Usuário / Login no Painel"
                      value={novoUsuarioAcesso}
                      onChange={(e) => setNovoUsuarioAcesso(e.target.value)}
                      placeholder="Ex: gabriel.silva"
                      helperText="Usado para entrar no /admin"
                      required
                    />

                    <Input
                      label="Senha de Acesso"
                      type="password"
                      value={novaSenhaAcesso}
                      onChange={(e) => setNovaSenhaAcesso(e.target.value)}
                      placeholder="eira@1212"
                      helperText="Padrão inicial da igreja"
                      required
                    />

                    {novaFuncaoSelecionada === 'conexao' ? (
                      <div className="sm:col-span-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start space-x-2">
                        <HeartHandshake className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Acesso Exclusivo à Recepção & Conexão</p>
                          <p className="text-[11px] text-sky-800">
                            Esta pessoa terá acesso restrito ao módulo de visitantes e acolhimento do culto. Não gerenciará células nem eventos.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-tight text-[#0A0A0A] mb-1">
                          Rede Ministerial
                        </label>
                        <select
                          value={novaRedeSelecionada}
                          onChange={(e) => setNovaRedeSelecionada(e.target.value)}
                          className="w-full h-11 px-3 rounded-lg bg-white border border-[#E4E4E7] text-xs text-[#0A0A0A]"
                        >
                          <option value="Hype">Rede Hype (Teens / 12-17)</option>
                          <option value="One Way">Rede One Way (Jovens & Universitários)</option>
                          <option value="Homens">Rede de Homens</option>
                          <option value="Mulheres">Rede de Mulheres</option>
                          <option value="Casais">Rede de Casais</option>
                          <option value="Família">Rede da Família</option>
                          <option value="Geral">Rede Geral</option>
                        </select>
                      </div>
                    )}

                    {novaFuncaoSelecionada === 'lider_celula' && (
                      <div>
                        <Input
                          label="Nome da Célula"
                          value={novoNomeCelula}
                          onChange={(e) => setNovoNomeCelula(e.target.value)}
                          placeholder="Ex: Célula Betel"
                          helperText="Identificação da célula que lidera"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação do Modal */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#F4F4F5]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setModalFuncaoAberto(false);
                    setPessoaSelecionada(null);
                  }}
                  disabled={salvandoFuncao}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={salvandoFuncao}
                >
                  {salvandoFuncao ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>Salvar Nova Função</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};