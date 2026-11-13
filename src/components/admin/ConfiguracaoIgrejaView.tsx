'use client';

// src/components/admin/ConfiguracaoIgrejaView.tsx

import React, { useState } from 'react';
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
} from 'lucide-react';

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
  } = useAdminStore();

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
    if (file.size > 5 * 1024 * 1024) {
      erro('O banner institucional deve ter no máximo 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBannerUrl(dataUrl);
      sucesso('Upload do banner realizado com sucesso!');
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

          {/* Banner: URL ou Upload */}
          <div className="space-y-1.5">
            <Input
              label="URL do Banner Superior (16:9)"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
            <div className="flex items-center space-x-2 pt-1">
              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F4F4F5] border border-[#E4E4E7] hover:border-black cursor-pointer transition-colors text-[#0A0A0A]">
                <Upload className="w-3.5 h-3.5" />
                <span>Fazer upload do Banner</span>
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
            placeholder="@eirachurch"
          />

          <Input
            label="E-mail de Contato"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@eirachurch.com.br"
          />
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
