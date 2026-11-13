# LAUNCH-CHECKLIST.md — Checklist de Engenharia e Prontidão de Lançamento

## Sistema de Gestão de Eventos — Eira Church (White Label Platform)

---

## 1. Verificação de Variáveis de Ambiente e Segredos

| Variável | Escopo | Descrição | Status de Prontidão |
|---|---|---|---|
| `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Frontend | URL da instância de produção do Supabase | Requer preenchimento com a URL do projeto Supabase oficial da igreja. |
| `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Chave pública anônima do Supabase | Requer preenchimento com a anon key de produção. |
| `VITE_MP_PUBLIC_KEY` | Frontend | Chave pública de produção do Mercado Pago | Requer substituição da chave Sandbox pela credencial `APP_USR-...` oficial. |
| `VITE_APP_URL` / `NEXT_PUBLIC_APP_URL` | Frontend | URL canônica de produção (`https://eventos.eirachurch.com.br`) | Configurada como padrão no código e modelos. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Edge Functions) | Chave mestre de serviço (NUNCA expor no cliente) | Deve ser gravada via `supabase secrets set`. |
| `MP_ACCESS_TOKEN` | Backend (Edge Functions) | Access Token privado do Mercado Pago para criar preferências | Deve ser gravado via `supabase secrets set`. |
| `MP_WEBHOOK_SECRET` | Backend (Edge Functions) | Segredo do Webhook do Mercado Pago para HMAC-SHA256 | Gerado no painel de desenvolvedores do MP ao cadastrar a URL de notificação. |

---

## 2. Configurações de Domínio, DNS e SSL

- [x] **Domínio Canônico**: `eventos.eirachurch.com.br` (ou domínio próprio da igreja parceira no modelo White Label).
- [ ] **Apontamento DNS**:
  - Tipo: `CNAME`
  - Nome: `eventos` (ou `@` se for domínio raiz)
  - Destino: `cname.vercel-dns.com` (ou endpoint da hospedagem escolhida).
- [x] **Certificado SSL / HTTPS**: Emissão automática de certificado TLS 1.3 com renovação automática via Vercel / Let's Encrypt e redirecionamento forçado de HTTP para HTTPS.
- [x] **Tratamento de 404**: Página [not-found.tsx](file:///c:/Users/Alessandro/system/src/app/not-found.tsx) estilizada e funcional, com link de retorno seguro para a Home.
- [x] **Robots e Sitemap**:
  - [robots.ts](file:///c:/Users/Alessandro/system/src/app/robots.ts) bloqueando `/admin` e liberando `/` e `/evento/*`.
  - [sitemap.ts](file:///c:/Users/Alessandro/system/src/app/sitemap.ts) com atualização diária de todos os eventos ativos.

---

## 3. Segurança, Banco de Dados e Backups

- [x] **Row Level Security (RLS)**: Habilitado e ativo em 100% das tabelas (`igrejas`, `eventos`, `inscricoes`, `inscricao_tentativas`, `visitantes_conexao`, `celulas`).
- [x] **Leitura de Inscrições Blindada**: Usuários anônimos não possuem permissão de SELECT na tabela `inscricoes` (proteção rigorosa à privacidade e dados de menores de acordo com a LGPD).
- [x] **Permissões de Liderança**: Pastores, administradores e líderes (`role IN ('admin', 'pastor', 'lider')`) autorizados para visualização e gestão de inscritos e eventos.
- [x] **Rate Limiting Criptográfico**: Função `check_rate_limit` no Postgres protegendo contra submissões em massa (máx. 3 tentativas/hora/IP utilizando hash SHA-256 sem armazenar IPs crus).
- [ ] **Estratégia de Backups do Postgres**:
  - Ativar backups diários automáticos com Point-in-Time Recovery (PITR) no painel do Supabase Pro/Team.
  - Exportação manual periódica via CLI: `supabase db dump -f backup_eira.sql`.

---

## 4. Auditoria Final do Portão Anti-IA

- [x] **Zero Gradientes Artificiais**: Paleta monocromática com Branco Puro, Preto Profundo e Amarelo Destaque (#FACC15).
- [x] **Zero Emojis como Controles**: Todos os botões, status e abas usam ícones vetoriais SVG de 1.75px (Lucide Icons).
- [x] **Tipografia com Propósito**: Fonte Manrope (Google Fonts) aplicada em display monumental (800) e corpo funcional (400/500) com algarismos tabulares.
- [x] **Zero Fórmulas Prontas de SaaS**: Ausência de tabela falsa de "3 colunas de planos"; precificação real por evento ou gratuidade com salto de pagamento.
- [x] **Zero Depoimentos Inventados**: Foco em dados, vagas reais e formulários eficientes.

---

## 5. Plano de Rollback e Monitoramento

1. **Rollback de Frontend**: Em caso de falha de release na Vercel/Netlify, clicar em *"Instant Rollback"* no dashboard de deployments para reativar o build anterior em menos de 10 segundos.
2. **Rollback de Banco de Dados**: Cada migração SQL em `supabase/migrations/` possui sua instrução de reversão equivalente. Em caso de necessidade:
   ```sql
   -- Exemplo de rollback da migracao 003
   DROP POLICY IF EXISTS "inscricoes_admin_total" ON inscricoes;
   DROP POLICY IF EXISTS "inscricoes_publico_inserir" ON inscricoes;
   ```
3. **Monitoramento de Logs**:
   - Acompanhamento de requisições de pagamento em tempo real nos logs das Edge Functions (`supabase functions logs webhook-mercadopago`).

---

## 6. Pendências Operacionais da Igreja (Pré-Lançamento)

1. **Conta de Produção Mercado Pago**:
   - Acessar o portal de desenvolvedores do Mercado Pago da igreja e copiar o `Access Token` e `Public Key` de produção.
2. **Criação do Usuário Administrador no Supabase Auth**:
   - Criar o e-mail da secretaria (ex.: `secretaria@eirachurch.com.br`) e executar no SQL Editor do Supabase:
     ```sql
     UPDATE auth.users
     SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
     WHERE email = 'secretaria@eirachurch.com.br';
     ```
3. **Banners dos Primeiros Eventos**:
   - Fazer upload das imagens dos banners em proporção 16:9 no Supabase Storage e associar aos eventos criados.
