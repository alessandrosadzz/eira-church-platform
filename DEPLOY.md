# 🚀 Guia de Deploy Rápido — Eira Church Platform

Este guia ensina como colocar o MVP no ar em **menos de 5 minutos** usando **Vercel** e **Supabase**.

---

## ⚡ Método 1: Deploy Instantâneo via Vercel (Recomendado)

O projeto é construído em **Next.js 14 App Router**, nativamente otimizado para a Vercel com HTTPS automático e CDN global.

### Passo 1: Executar o comando no terminal
No terminal do projeto (`c:\Users\Alessandro\system`), execute:

```bash
npx vercel
```

1. Se for a primeira vez, faça login escolhendo **GitHub** ou **E-mail**.
2. O assistente perguntará:
   - `Set up and deploy?` ➜ Digite **`y`** (Yes)
   - `Which scope?` ➜ Pressione **Enter** (sua conta)
   - `Link to existing project?` ➜ Digite **`n`** (No)
   - `Project's name?` ➜ Digite **`eira-church`** (ou pressione Enter)
   - `In which directory is your code located?` ➜ Pressione **Enter** (`./`)
   - `Want to modify these settings?` ➜ Digite **`n`** (No)
3. A Vercel construirá o projeto e fornecerá um link público instantâneo (ex: `https://eira-church.vercel.app`).

> 💡 **Nota de Resiliência:** Mesmo sem conectar banco de dados agora, o MVP já funcionará 100% no navegador (catálogo de eventos, inscrições, conexão de visitantes, células com Google Maps, painel administrativo e modo claro/escuro) graças ao nosso sistema de persistência local resiliente.

---

## 📦 Método 2: Via GitHub (Com Deploy Contínuo Automático)

Para manter atualizações automáticas a cada melhoria:

### Passo 1: Criar repositório no GitHub
1. Acesse [github.com/new](https://github.com/new) e crie um repositório chamado `eira-church-platform` (Público ou Privado).

### Passo 2: Enviar o código
No terminal, execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/eira-church-platform.git
git push -u origin main
```

### Passo 3: Conectar na Vercel
1. Acesse [vercel.com/new](https://vercel.com/new).
2. Clique em **Import** no repositório `eira-church-platform`.
3. Clique em **Deploy**. A cada novo commit que você fizer, a Vercel atualiza seu site automaticamente!

---

## 🗄️ Conectando o Banco de Dados Oficial (Supabase)

Para sincronizar todos os dados em tempo real na nuvem entre múltiplos computadores e celulares:

1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito (ex: `eira-church-db`).
2. No menu lateral, acesse **SQL Editor** > **New Query**.
3. Copie e execute o conteúdo dos seguintes arquivos em ordem:
   - `supabase/migrations/001_init.sql` (Criação de tabelas, índices e funções)
   - `supabase/migrations/002_rate_limiting.sql` (Proteção de formulários)
   - `supabase/migrations/003_rls.sql` (Regras de segurança por perfil)
   - `supabase/seed.sql` (Eventos iniciais)
4. Acesse **Project Settings** > **API** e copie:
   - **Project URL**
   - **anon public key**
5. No painel da Vercel em **Settings** > **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
   - `NEXT_PUBLIC_APP_URL` = `https://eira-church.vercel.app` (ou seu domínio próprio)
6. Faça um redeploy na Vercel para ativar.

---

## 🌐 Configurando o Domínio Próprio da Igreja

Para usar um endereço como `eventos.eirachurch.com.br`:

1. No painel da Vercel, acesse **Settings** > **Domains**.
2. Digite `eventos.eirachurch.com.br` e clique em **Add**.
3. No seu provedor de domínio (Registro.br, Cloudflare, Hostgator, etc.), crie um apontamento DNS:
   - **Tipo:** `CNAME`
   - **Nome / Host:** `eventos`
   - **Destino / Valor:** `cname.vercel-dns.com`
4. A Vercel ativará o certificado HTTPS/SSL gratuitamente em poucos minutos.

---

## 👥 Rotas Principais para Compartilhar

- 🏠 **Portal Principal / Catálogo de Eventos:** `https://seu-dominio.vercel.app/`
- 🤝 **Boas-Vindas / Ficha do Visitante:** `https://seu-dominio.vercel.app/boas-vindas` *(Ideal para QR Code no telão/púlpito)*
- 📍 **Cadastro de Célula para Líderes:** `https://seu-dominio.vercel.app/cadastro-lider` *(Link para enviar no grupo de líderes)*
- 🔐 **Painel Administrativo & Liderança:** `https://seu-dominio.vercel.app/admin` *(Acesso aos eventos, células, conexão e relatórios)*
