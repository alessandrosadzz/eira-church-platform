-- =========================================================================
-- EIRA CHURCH PLATFORM — SCHEMA OFICIAL UNIFICADO (SUPABASE / POSTGRESQL)
-- =========================================================================
-- Este script cria todas as tabelas, índices, enums e políticas de segurança (RLS).
-- Execute-o no SQL Editor do Supabase para inicializar seu banco de produção zerado.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enums Tipados
DO $$ BEGIN
  CREATE TYPE status_inscricao AS ENUM ('pendente', 'pago', 'isento');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE metodo_pagamento AS ENUM ('pix', 'cartao', 'boleto', 'dinheiro', 'balcao', 'isento');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE categoria_evento AS ENUM ('Hype', 'One Way', 'Padrão', 'Encontro', 'Acampamento', 'Conferência', 'Culto especial', 'Outro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Tabela de Configuração Institucional (White Label)
CREATE TABLE IF NOT EXISTS igrejas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  nome         text NOT NULL DEFAULT 'Eira Church',
  subtitulo    text DEFAULT 'Uma igreja viva, acolhedora e relevante em células',
  logo_url     text DEFAULT '',
  banner_url   text DEFAULT '',
  tema_padrao  text NOT NULL DEFAULT 'eira-signature',
  cor_destaque text NOT NULL DEFAULT '#FACC15',
  endereco     jsonb DEFAULT '{}',
  cultos       jsonb DEFAULT '[]',
  telefone     text DEFAULT '',
  whatsapp     text DEFAULT '',
  instagram    text DEFAULT '',
  email        text DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 3. Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  igreja_id    uuid REFERENCES igrejas(id) ON DELETE CASCADE,
  slug         text UNIQUE NOT NULL,
  nome         text NOT NULL,
  descricao    text,
  data_inicio  date NOT NULL,
  data_fim     date,
  vagas        integer NOT NULL DEFAULT 100,
  valor        numeric(10,2) NOT NULL DEFAULT 0,
  categoria    categoria_evento NOT NULL DEFAULT 'Padrão',
  rede         text NOT NULL DEFAULT 'Padrão',
  campos       jsonb NOT NULL DEFAULT '["nome","telefone","email","nascimento"]',
  ativo        boolean NOT NULL DEFAULT true,
  imagem_url   text,
  local_nome   text DEFAULT 'Auditório Principal — Eira Church',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 4. Tabela de Inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id            uuid NOT NULL REFERENCES eventos(id) ON DELETE RESTRICT,
  nome                 text NOT NULL,
  email                text,
  telefone             text,
  nascimento           date,
  idade                integer,
  is_menor             boolean DEFAULT false,
  nome_responsavel     text,
  telefone_responsavel text,
  email_responsavel    text,
  observacoes_saude    text,
  transporte           text,
  participa_celula     boolean DEFAULT false,
  status               status_inscricao NOT NULL DEFAULT 'pendente',
  metodo_pag           metodo_pagamento,
  valor_pago           numeric(10,2),
  comprovante_url      text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- 5. Tabela de Pessoas Novas / Visitantes (Conexão)
CREATE TABLE IF NOT EXISTS visitantes_conexao (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           text NOT NULL,
  telefone       text NOT NULL,
  bairro         text NOT NULL,
  quem_convidou  text,
  faixa_etaria   text DEFAULT 'Adulto',
  quer_celula    boolean DEFAULT true,
  pedido_oracao  text,
  data_visita    date NOT NULL DEFAULT CURRENT_DATE,
  status         text NOT NULL DEFAULT 'novo', -- 'novo', 'em_contato', 'integrado'
  observacoes    text,
  cadastrado_por text DEFAULT 'Recepção',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- 6. Tabela de Células
CREATE TABLE IF NOT EXISTS celulas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text NOT NULL,
  rede            text NOT NULL DEFAULT 'Hype',
  lider_nome      text NOT NULL,
  lider_telefone  text NOT NULL,
  vice_lider_nome text,
  anfitriao_nome  text,
  dia_semana      text NOT NULL DEFAULT 'Quinta-feira',
  horario         text NOT NULL DEFAULT '20h00',
  bairro          text NOT NULL,
  endereco        text NOT NULL,
  maps_url        text,
  ativo           boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 7. Tabela de Membros de Célula
CREATE TABLE IF NOT EXISTS celula_membros (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id    uuid NOT NULL REFERENCES celulas(id) ON DELETE CASCADE,
  nome         text NOT NULL,
  telefone     text,
  tempo_celula text DEFAULT 'Recém-chegado',
  batizado     boolean DEFAULT false,
  funcao       text DEFAULT 'Membro',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 8. Tabela de Contas de Líderes
CREATE TABLE IF NOT EXISTS lideres_contas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text NOT NULL,
  usuario_email text UNIQUE NOT NULL,
  senha_hash    text NOT NULL,
  telefone      text,
  celula_nome   text,
  rede          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 9. Tabela de Rate Limiting (Anti-Spam)
CREATE TABLE IF NOT EXISTS inscricao_tentativas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  ip_hash    text NOT NULL,
  email      text,
  created_at timestamptz DEFAULT now()
);

-- 10. Inserir Registro Inicial da Eira Church
INSERT INTO igrejas (id, slug, nome, subtitulo, logo_url, banner_url, tema_padrao, cor_destaque)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'eira-church',
  'Eira Church',
  'Uma igreja viva, acolhedora e relevante em células',
  '',
  '',
  'eira-signature',
  '#FACC15'
) ON CONFLICT (slug) DO NOTHING;

-- 11. Habilitar Segurança por Linha (RLS)
ALTER TABLE igrejas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes_conexao   ENABLE ROW LEVEL SECURITY;
ALTER TABLE celulas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE celula_membros       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricao_tentativas ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas e Administrativas
CREATE POLICY "igrejas_leitura_livre" ON igrejas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "eventos_leitura_livre" ON eventos FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "eventos_admin_tudo" ON eventos FOR ALL TO authenticated USING (true);
CREATE POLICY "inscricoes_inserir_publico" ON inscricoes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "inscricoes_admin_tudo" ON inscricoes FOR ALL TO authenticated USING (true);
CREATE POLICY "visitantes_inserir_publico" ON visitantes_conexao FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "visitantes_admin_tudo" ON visitantes_conexao FOR ALL TO authenticated USING (true);
CREATE POLICY "celulas_leitura_livre" ON celulas FOR SELECT TO anon, authenticated USING (ativo = true);
CREATE POLICY "celulas_admin_tudo" ON celulas FOR ALL TO authenticated USING (true);
CREATE POLICY "membros_admin_tudo" ON celula_membros FOR ALL TO authenticated USING (true);
CREATE POLICY "tentativas_inserir_publico" ON inscricao_tentativas FOR INSERT TO anon, authenticated WITH CHECK (true);
