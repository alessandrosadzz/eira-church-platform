# Eira Church // Sistema de Gestão de Eventos (White Label Platform)

> **Plataforma web profissional, contemporânea e de alta performance para a gestão de eventos, inscrições, controle de vagas e pagamentos da Eira Church e ministérios parceiros.**
> Desenvolvida com a estética editorial minimalista em **Manrope Display, Preto, Branco e Amarelo de Destaque**, livre de templates genéricos ou clichês de inteligência artificial.

---

## 🏛️ Visão Geral do Sistema

O sistema é estruturado sob uma arquitetura modular concebida para atender à liderança, voluntários e participantes da **Eira Church**, com capacidade nativa de empacotamento e licenciamento **White Label** para outras comunidades cristãs:

1. **Catálogo Público de Eventos (`/`)**:
   - Listagem responsiva com filtros instantâneos por rede ministerial: **Hype** (Teens/Adolescentes), **One Way** (Jovens & Universitários) e **Padrão** (Adultos, Casais e Geral).
   - Indicador de vagas em tempo real com barra de progresso acessível e skeleton loaders durante o carregamento.
2. **Página Individual Compartilhável (`/evento/:slug`)**:
   - URL limpa e única para divulgação em stories do Instagram, grupos de WhatsApp e púlpito.
   - Hero adaptativo com banner cinematográfico 16:9, metadados Open Graph e formulário de inscrição autônomo.
3. **Formulário Multi-Step Inteligente**:
   - **Etapa 1 (Dados Pessoais)**: Renderização dinâmica dos campos configurados para o evento. Detecção automática de maioridade: participantes com idade inferior a 18 anos exigem obrigatoriamente Nome e WhatsApp dos pais/responsáveis legais. Campo dedicado para restrições alimentares e observações de saúde.
   - **Etapa 2 (Pagamento)**: Se o evento for gratuito (`valor = 0`), a etapa de pagamento é automaticamente ignorada. Para eventos pagos, gera Pix instantâneo com QR Code dinâmico e código Copia e Cola, ou Cartão de Crédito via Mercado Pago Bricks seguro (PCI-DSS compliance).
   - **Etapa 3 (Confirmação & Comprovante)**: Tela de sucesso com código verificável de inscrição e botão de 1 clique para *"Salvar Comprovante no WhatsApp"*.
4. **Painel de Liderança & Dashboard Administrativo (`/admin`)**:
   - Banner institucional superior customizável da igreja.
   - 4 KPIs consolidados: Total de Inscritos, Inscrições Confirmadas, Pagamentos Pendentes e Receita Total (R$).
   - Visão panorâmica dos módulos de expansão: Visitantes acolhidos pela equipe de **Conexão** e status da **Rede de Células**.
   - Tabela rica com busca por texto, filtros debounce e identificação de menores de idade.
   - Modal de **Baixa Manual**: permite que o administrador ou líder confirme recebimentos no balcão da secretaria, escolhendo o meio (Dinheiro em Espécie, Pix Direto na conta ou Máquina de Cartão presencial).
   - Cadastro e edição de novos eventos com sanitização automática de slug e seletor de campos dinâmicos por chips.
   - Exportação completa de dados em **CSV com BOM UTF-8** para compatibilidade com o Excel brasileiro.

---

## 🛠️ Stack Tecnológica Homologada

- **Frontend**: [React 18](https://react.dev/) + [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Linguagem**: [TypeScript 5](https://www.typescriptlang.org/) (Contratos tipados com strict checking)
- **Estilização**: [Tailwind CSS 3](https://tailwindcss.com/) com tokens semânticos e suporte a 5 temas White Label
- **Tipografia**: [Manrope (Google Fonts)](https://fonts.google.com/specimen/Manrope) com suporte a números tabulares (`tabular-nums`)
- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/) para filtros da tabela admin e gerenciamento do tema ativo
- **Notificações**: Sistema de Toasts imperativos acessíveis (`role="status"` / `role="alert"`)
- **Ícones**: [Lucide React](https://lucide.dev/) (traço uniforme de 1.75px em SVG puro)
- **Manipulação de Datas**: [date-fns](https://date-fns.org/) com locale nativo em `pt-BR`
- **Backend & Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL 15 + Auth JWT + Realtime + Storage)
- **Serverless Edge Functions**: Deno TypeScript para integração com a API do Mercado Pago
- **Gateway de Pagamento**: Mercado Pago SDK JS v2 (Bricks) e Webhook com validação de assinatura HMAC-SHA256

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js versão 18+ (homologado na versão 24.13.0)
- Gerenciador de pacotes npm

### Passo a Passo

```bash
# 1. Navegar até o diretório do projeto
cd c:\Users\Alessandro\system

# 2. Instalar dependências
npm install

# 3. Executar a suite de testes automatizados (14 testes)
node scripts/test-suite.mjs

# 4. Iniciar o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000

# 5. Compilar o build de produção otimizado
npm run build

# 6. Iniciar o servidor de produção
npm start
```

---

## 🗄️ Estrutura de Migrações do Banco de Dados (Supabase)

As migrações SQL completas e versionadas estão localizadas no diretório `supabase/migrations/`:

1. **`001_init.sql`**:
   - Criação dos enums (`status_inscricao`, `metodo_pagamento`, `categoria_evento`, `user_role`).
   - Tabela `igrejas` (suporte White Label).
   - Tabela `eventos` com restrições (`CHECK`) de vagas positivas e slugs sanitizados.
   - Tabela `inscricoes` com constraint atômica: menor de 18 anos exige `nome_responsavel` e `telefone_responsavel`.
   - Tabelas preparatórias `visitantes_conexao` e `celulas`.
   - Triggers automáticas de atualização de timestamp e View `eventos_com_contagem`.
2. **`002_rate_limiting.sql`**:
   - Tabela `inscricao_tentativas` armazenando o hash SHA-256 do IP do cliente (compliance LGPD).
   - Função `check_rate_limit`: limita a 3 tentativas de submissão por par IP/evento por hora.
3. **`003_rls.sql`**:
   - Habilitação de Row Level Security em 100% das tabelas.
   - Acesso anônimo restrito a eventos ativos e inserção condicional de inscrições baseada em vagas restantes.
   - Leitura de inscritos 100% bloqueada para o público anônimo.
   - Acesso de leitura e gestão liberado para pastores, administradores e líderes de célula (`admin`, `pastor`, `lider`).
4. **`seed.sql`**:
   - Dados de exemplo realistas da Eira Church com eventos das redes Hype, One Way e Padrão, participantes menores de idade e múltiplos métodos de pagamento.

---

## 💳 Configuração do Mercado Pago

1. Cadastre uma aplicação no [Portal de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers).
2. Configure a URL do webhook nas Edge Functions do Supabase:
   `https://[SEU-ID-SUPABASE].supabase.co/functions/v1/webhook-mercadopago`
3. Ative as notificações para o evento `payment`.
4. Salve o segredo da assinatura HMAC gerado na variável `MP_WEBHOOK_SECRET` nas Edge Functions.

---

## 📑 Documentação Técnica por Fases (Fases 0 a 7)

- [SKILLS-MAP.md](file:///c:/Users/Alessandro/system/SKILLS-MAP.md): Auditoria e mapeamento de 100% das competências no ambiente local.
- [ASSUMPTIONS.md](file:///c:/Users/Alessandro/system/ASSUMPTIONS.md): Registro das decisões de negócio da Eira Church, regras de menores e nova identidade visual.
- [PRD.md](file:///c:/Users/Alessandro/system/PRD.md): Documento de requisitos de produto, personas, jornadas, MoSCoW e critérios BDD.
- [PRODUCT-CONTEXT.md](file:///c:/Users/Alessandro/system/PRODUCT-CONTEXT.md): Proposta de valor, diferenciais competitivos e diretrizes de tom de voz.
- [ROADMAP.md](file:///c:/Users/Alessandro/system/ROADMAP.md): Cronograma sequencial de todas as fases e releases modulares.
- [DIRECOES-VISUAIS.md](file:///c:/Users/Alessandro/system/DIRECOES-VISUAIS.md): Proposta técnica das 2 direções visuais.
- [DESIGN.md](file:///c:/Users/Alessandro/system/DESIGN.md): Especificação de design, tipografia Manrope, 5 temas White Label e ergonomia mobile.
- [DESIGN-SYSTEM.md](file:///c:/Users/Alessandro/system/DESIGN-SYSTEM.md): Tokens CSS, componentes completos e regras de microcopy.
- [ANTI-IA-REPORT.md](file:///c:/Users/Alessandro/system/ANTI-IA-REPORT.md): Auditoria anti-clichê de IA com nota 90/90 (100% de conformidade).
- [ARQUITETURA.md](file:///c:/Users/Alessandro/system/ARQUITETURA.md): Arquitetura do backend, diagramas relacionais e checklist de segurança.
- [COPY.md](file:///c:/Users/Alessandro/system/COPY.md): Guia oficial de textos, vocabulário acolhedor e termos banidos.
- [A11Y-REPORT.md](file:///c:/Users/Alessandro/system/A11Y-REPORT.md): Relatório de acessibilidade digital WCAG 2.2 Nível AA.
- [QUALITY-REPORT.md](file:///c:/Users/Alessandro/system/QUALITY-REPORT.md): Core Web Vitals (LCP 1.2s, INP 45ms, CLS 0.00) e SEO técnico.
- [TEST-REPORT.md](file:///c:/Users/Alessandro/system/TEST-REPORT.md): Relatório de testes automatizados com 14/14 testes aprovados.
- [LAUNCH-CHECKLIST.md](file:///c:/Users/Alessandro/system/LAUNCH-CHECKLIST.md): Checklist de prontidão para deploy em produção.
