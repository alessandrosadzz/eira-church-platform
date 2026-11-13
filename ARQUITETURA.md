# ARQUITETURA.md — Arquitetura Técnica, Banco de Dados e Backend

## Sistema de Gestão de Eventos — Eira Church (White Label Platform)

---

## 1. Estrutura de Pastas do Projeto

A arquitetura do projeto segue o padrão modular desacoplado, com separação estrita entre lógica de apresentação, hooks de dados, contratos de domínio e infraestrutura de backend:

```
c:/Users/Alessandro/system/
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes primitivos (Tailwind puro)
│   │   │   ├── Button.tsx         # Variantes: primary, dark, secondary, danger
│   │   │   ├── Input.tsx          # 48px touch target, font 16px anti-zoom iOS
│   │   │   ├── Textarea.tsx       # Campo adaptativo para observações/saúde
│   │   │   ├── Badge.tsx          # Badges semânticos de status e categorias
│   │   │   ├── Toast.tsx          # Toasts empilháveis acessíveis (status/alert)
│   │   │   ├── Modal.tsx          # Focus trap, Escape, aria-modal="true"
│   │   │   └── ProgressBar.tsx    # Barra de vagas com atributos ARIA completos
│   │   ├── event/                 # Componentes de domínio de eventos
│   │   │   ├── EventCard.tsx      # Card público com proporção 16:9 e status
│   │   │   ├── EventHero.tsx      # Cabeçalho da página /evento/:slug
│   │   │   ├── EventCardSkeleton.tsx # Skeleton loader de mesma dimensão
│   │   │   └── VagasBadge.tsx     # Indicador de urgência de vagas
│   │   ├── form/                  # Formulário multi-step de inscrição
│   │   │   ├── InscricaoModal.tsx # Container do modal de inscrição
│   │   │   ├── InscricaoForm.tsx  # Formulário multi-step autônomo
│   │   │   ├── StepIndicator.tsx  # Indicador visual e acessível de etapas
│   │   │   ├── EtapaDados.tsx     # Etapa 1: Campos dinâmicos, menores e saúde
│   │   │   ├── EtapaPagamento.tsx # Etapa 2: Mercado Pago Pix e Cartão Bricks
│   │   │   └── EtapaSucesso.tsx   # Etapa 3: Comprovante e botão WhatsApp
│   │   ├── payment/               # Integrações de pagamento
│   │   │   ├── PixDisplay.tsx     # Renderização de QR Code e Copia-e-Cola
│   │   │   └── CardBrick.tsx      # Container do Mercado Pago Card Brick SDK
│   │   └── admin/                 # Componentes do painel administrativo
│   │       ├── AdminHeader.tsx    # Banner da igreja e boas-vindas
│   │       ├── MetricCard.tsx     # Cards de KPIs (Inscritos, Pagos, Receita)
│   │       ├── DataTable.tsx      # Tabela com busca, ordenação e ações
│   │       ├── FilterBar.tsx      # Filtros debounce por evento, status e método
│   │       ├── BaixaManualModal.tsx # Modal de confirmação manual de pagamento
│   │       └── EventoForm.tsx     # Criar / editar evento com seletor de campos
│   ├── hooks/
│   │   ├── useEventos.ts          # React Query: busca eventos com contagem de vagas
│   │   ├── useEvento.ts           # React Query: busca evento individual por slug
│   │   ├── useInscricoes.ts       # React Query: lista de inscritos e mutações
│   │   ├── useAuth.ts             # Gerenciamento de sessão Supabase Auth
│   │   ├── useRealtimeVagas.ts    # Assinatura Postgres Changes para vagas
│   │   └── useToast.ts            # Gerenciador imperativo de notificações
│   ├── lib/
│   │   ├── supabase.ts            # Singleton do cliente Supabase
│   │   ├── mercadopago.ts         # Loader dinâmico do SDK v2 Bricks
│   │   ├── slugify.ts             # Sanitização e geração de URLs amigáveis
│   │   ├── formatters.ts          # Moeda BRL, datas pt-BR e telefone
│   │   ├── categorias.ts          # Mapeamento de categorias e cores
│   │   └── exportCsv.ts           # Exportador CSV com BOM UTF-8 para Excel
│   ├── types/
│   │   ├── evento.ts              # Tipagem estrita de eventos e campos
│   │   ├── inscricao.ts           # Tipagem de inscrições e pagamentos
│   │   └── supabase.ts            # Tipos DDL gerados pelo Supabase CLI
│   ├── store/
│   │   └── adminStore.ts          # Zustand: filtros da tabela e aba ativa
│   ├── styles/
│   │   └── globals.css            # Variáveis CSS dos 5 temas e Tailwind
│   ├── pages/
│   │   ├── Home.tsx               # Catálogo público oficial /
│   │   ├── EventoSlug.tsx         # Página individual compartilhável /evento/:slug
│   │   ├── NotFound.tsx           # Tratamento de rota inexistente (404)
│   │   └── admin/
│   │       ├── Login.tsx          # Autenticação segura /admin
│   │       ├── Dashboard.tsx      # Visão geral unificada
│   │       ├── InscricoesPage.tsx # Gestão de participantes e baixa manual
│   │       └── EventosPage.tsx    # Gestão de eventos, banners e links
│   └── tests/
│       ├── setup.ts               # Setup global Vitest + Testing Library
│       ├── unit/                  # Testes de funções puras
│       ├── integration/           # Testes de hooks e formulário multi-step
│       └── e2e/                   # Playwright: fluxos ponta a ponta
├── supabase/
│   ├── migrations/
│   │   ├── 001_init.sql           # Schema base, enums, tabelas e views
│   │   ├── 002_rate_limiting.sql  # Rate limit criptográfico anti-spam
│   │   └── 003_rls.sql            # Políticas estritas de Row Level Security
│   ├── functions/
│   │   ├── criar-preferencia/     # Edge Function: Mercado Pago Preference
│   │   │   └── index.ts
│   │   └── webhook-mercadopago/   # Edge Function: Webhook com HMAC-SHA256
│   │       └── index.ts
│   └── seed.sql                   # Dados de demonstração realistas
├── .env.example                   # Modelo de variáveis de ambiente
├── tailwind.config.ts             # Configuração dos tokens de design
├── tsconfig.json                  # TypeScript 5 rigoroso
└── vite.config.ts                 # Configuração do Vite 5 e aliases
```

---

## 2. Modelo de Dados Relacional (ERD em Texto)

```
[igrejas] (White Label)
  ├── id (UUID, PK)
  ├── slug (TEXT, UNIQUE) — Ex: 'eira-church'
  ├── nome (TEXT) — Ex: 'Eira Church'
  ├── subtitulo (TEXT)
  ├── logo_url (TEXT)
  ├── banner_url (TEXT)
  ├── tema_padrao (TEXT) — 'eira-signature', 'solar-amber', etc.
  └── cor_destaque (TEXT)
        │ 1:N
        ▼
[eventos]
  ├── id (UUID, PK)
  ├── igreja_id (UUID, FK -> igrejas.id)
  ├── slug (TEXT, UNIQUE) — Ex: 'retiro-hype-mar-2025'
  ├── nome (TEXT) — Ex: 'Retiro Hype // Intensidade'
  ├── descricao (TEXT)
  ├── data_inicio (DATE)
  ├── data_fim (DATE, NULLABLE)
  ├── vagas (INTEGER)
  ├── valor (NUMERIC(10,2)) — 0.00 = Gratuito
  ├── categoria (ENUM: 'Hype', 'One Way', 'Padrão', 'Acampamento', etc.)
  ├── rede (TEXT) — 'Hype', 'One Way', 'Padrão'
  ├── campos (JSONB) — Ex: ["nome", "telefone", "nascimento", "observacoes_saude"]
  ├── imagem_url (TEXT) — Proporção 16:9
  ├── local_nome (TEXT)
  └── ativo (BOOLEAN)
        │ 1:N
        ▼
[inscricoes]
  ├── id (UUID, PK)
  ├── evento_id (UUID, FK -> eventos.id)
  ├── nome (TEXT)
  ├── email (TEXT, NULLABLE)
  ├── telefone (TEXT, NULLABLE)
  ├── nascimento (DATE, NULLABLE)
  ├── idade (INTEGER, NULLABLE)
  ├── nome_responsavel (TEXT, NULLABLE)      ──┐
  ├── telefone_responsavel (TEXT, NULLABLE)  ──┴─> Obrigatório se nascimento < 18 anos
  ├── observacoes_saude (TEXT, NULLABLE) — Alergias/Intolerâncias
  ├── status (ENUM: 'pendente', 'pago', 'isento')
  ├── metodo_pag (ENUM: 'pix', 'cartao', 'boleto', 'dinheiro', 'balcao', 'isento')
  ├── mp_payment_id (TEXT, NULLABLE)
  ├── mp_preference_id (TEXT, NULLABLE)
  └── comprovante_hash (TEXT, UNIQUE)
        │
        │ N:1 (Proteção)
        ▼
[inscricao_tentativas]
  ├── id (UUID, PK)
  ├── evento_id (UUID, FK -> eventos.id)
  ├── ip_hash (TEXT) — SHA-256 (Proteção de privacidade LGPD)
  └── created_at (TIMESTAMPTZ)
```

### View Materializada / Dinâmica: `eventos_com_contagem`
Agrega e calcula em tempo de execução com performance indexada:
- `inscritos_confirmados`: Total de inscrições com `status != 'pendente'`.
- `total_inscritos`: Total bruto de submissões.
- `vagas_restantes`: `vagas - inscritos_confirmados`.
- `receita_confirmada`: Soma de `valor` para inscrições com `status = 'pago'`.

---

## 3. Políticas de Row Level Security (RLS) e Matriz de Permissões

| Tabela | Operação | Role `anon` (Público) | Role `authenticated` (`admin`, `pastor`, `lider`) | Justificativa de Segurança |
|---|---|---|---|---|
| `igrejas` | SELECT | Permitido (100%) | Permitido (100%) | Exibição de marca e temas no frontend |
| `igrejas` | ALL | Negado | Permitido (`admin`, `pastor`) | Apenas a administração edita dados institucionais |
| `eventos` | SELECT | Permitido apenas onde `ativo = true` | Permitido (ativos e inativos) | Visitantes não veem eventos cancelados |
| `eventos` | ALL | Negado | Permitido (`admin`, `pastor`, `lider`) | Líderes, pastores e admins gerenciam eventos |
| `inscricoes` | SELECT | **Negado (0%)** | Permitido (`admin`, `pastor`, `lider`) | **LGPD Crítica**: Apenas liderança autorizada consulta |
| `inscricoes` | INSERT | **Permitido condicional** (Evento ativo e `vagas_restantes > 0`) | Permitido | Permite submissão sem login |
| `inscricoes` | UPDATE | Negado | Permitido (`admin`, `pastor`, `lider`) | Baixa manual e controle de presença pela liderança |
| `inscricoes` | DELETE | Negado | Permitido (`admin`, `pastor`) | Exclusões reservadas à secretaria |

---

## 4. Endpoints, Rotas e Webhooks

### 4.1 Rotas do Frontend (SPA)
- `/`: Catálogo público responsivo com grid de eventos e filtros por rede (Hype, One Way, Padrão).
- `/evento/:slug`: Página individual compartilhável com hero, contagem de vagas e formulário autônomo.
- `/admin`: Tela de login administrativo com Supabase Auth.
- `/admin/dashboard`: Painel administrativo com abas (Inscrições, Eventos, Novo Evento, Visitantes, Células).
- `*`: Página 404 limpa com link de retorno à Home.

### 4.2 Integrações de Backend (Supabase Edge Functions)

#### 1. Edge Function: `POST /functions/v1/criar-preferencia`
Gera a preferência de checkout oficial no Mercado Pago.
- **Payload de Entrada**:
  ```json
  {
    "evento_id": "22222222-2222-2222-2222-222222222221",
    "inscricao_id": "33333333-3333-3333-3333-333333333331",
    "nome": "Lucas Albuquerque",
    "email": "lucas.alb@gmail.com",
    "valor": 150.00,
    "nome_evento": "Retiro Hype // Intensidade & Propósito",
    "evento_slug": "retiro-hype-mar-2025"
  }
  ```
- **Resposta de Sucesso (200 OK)**:
  ```json
  {
    "preference_id": "123456789-abcdef-1234",
    "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
    "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
  }
  ```

#### 2. Edge Function: `POST /functions/v1/webhook-mercadopago`
Processa a notificação assíncrona enviada pelo Mercado Pago quando o Pix ou Cartão é aprovado.
- **Headers Críticos**:
  - `x-signature`: Assinatura criptográfica contendo `ts` (timestamp) e `v1` (hash HMAC).
  - `x-request-id`: Identificador único da requisição.
- **Payload de Exemplo recebido do Mercado Pago**:
  ```json
  {
    "action": "payment.updated",
    "api_version": "v1",
    "data": { "id": "9876543210" },
    "date_created": "2025-03-14T10:15:30Z",
    "id": 123456789,
    "live_mode": false,
    "type": "payment"
  }
  ```
- **Fluxo de Processamento**:
  1. Constrói o manifesto de validação: `id:9876543210;request-id:{x-request-id};ts:{ts};`.
  2. Calcula o HMAC-SHA256 utilizando `MP_WEBHOOK_SECRET`.
  3. Se a assinatura for válida, consulta a API `https://api.mercadopago.com/v1/payments/9876543210`.
  4. Identifica o status `approved` e o `external_reference` (ID da inscrição).
  5. Atualiza a inscrição para `status = 'pago'` e registra o método (`pix` ou `cartao`).

---

## 5. Tratamento de Erros, Resiliência e Retries

| Código / Cenário | Origem | Ação do Sistema | Feedback ao Usuário |
|---|---|---|---|
| `RLS Exception: Vagas esgotadas` | Tentativa de INSERT concorrente | A transação é abortada atomicamente no Postgres | Notificação Toast de Alerta: "Desculpe, as vagas deste evento acabaram de se esgotar." |
| `Rate Limit Excedido (> 3 tentativas/h)` | Função `check_rate_limit` | Bloqueio antes do insert | "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente." |
| `Falha na API do Mercado Pago` | Timeout ou instabilidade do gateway | Retry automático com backoff exponencial (1x após 2s) | "Instabilidade temporária no processamento de pagamento. Você pode tentar novamente ou pagar no balcão." |
| `Queda de Conexão no Dispositivo` | Navegador offline | TanStack Query pausa mutações e tenta reconectar | Banner persistente: "Sem conexão com a internet. Verifique sua rede." |

---

## 6. Checklist de Segurança Obrigatório

- [x] **Validação de Entrada Rigorosa**:
  - Validação tipada via Zod no cliente antes de qualquer submissão.
  - Constraints SQL no Postgres (`CHECK` de e-mail, `CHECK` de vagas > 0, `CHECK` de menor requer responsável).
- [x] **Autenticação e Autorização**:
  - Supabase Auth com JWT assinado e verificação de role (`admin`, `pastor`) em todas as operações restritas.
- [x] **Row Level Security (RLS) 100% Ativa**:
  - Nenhuma tabela acessível sem políticas declarativas explícitas.
  - Tabela `inscricoes` com leitura bloqueada para usuários anônimos.
- [x] **Rate Limit & Proteção Anti-Spam**:
  - Tabela e função `check_rate_limit` no Postgres com hash SHA-256 do IP do cliente (sem armazenar IP puro).
- [x] **Segredos Fora do Frontend**:
  - `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` existem exclusivamente no ambiente seguro das Edge Functions (Deno).
  - O frontend consome apenas a chave pública `VITE_MP_PUBLIC_KEY` e a chave anônima do Supabase.
- [x] **Conformidade LGPD & Proteção a Menores**:
  - Consentimento explícito dos pais/responsáveis para participantes menores de 18 anos.
  - Finalidade específica para organização do evento, sem cessão de dados para terceiros.
- [x] **Validação Criptográfica de Webhook**:
  - Verificação de assinatura HMAC-SHA256 em 100% das notificações de pagamento recebidas.

---

## 7. Estratégia de Deploy e Migrações

### 7.1 Banco de Dados (Supabase)
```bash
# 1. Aplicar migrations sequenciais
supabase db push

# 2. Executar deploy das Edge Functions
supabase functions deploy criar-preferencia
supabase functions deploy webhook-mercadopago

# 3. Configurar segredos do Mercado Pago no ambiente de produção
supabase secrets set MP_ACCESS_TOKEN="APP_USR-..."
supabase secrets set MP_WEBHOOK_SECRET="000000..."
supabase secrets set APP_URL="https://eventos.eirachurch.com.br"
```

### 7.2 Frontend (Vercel / Netlify)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Configuração de Rewrite SPA**: Todas as rotas virtuais (`/evento/*`, `/admin/*`) redirecionadas para `/index.html` com cabeçalhos de segurança HTTP (CSP, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin).
