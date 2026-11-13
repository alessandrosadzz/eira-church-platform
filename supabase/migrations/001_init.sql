-- supabase/migrations/001_init.sql
-- Sistema de Gestão de Eventos — Eira Church (White Label Platform)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enums Tipados
CREATE TYPE status_inscricao AS ENUM ('pendente', 'pago', 'isento');
CREATE TYPE metodo_pagamento AS ENUM ('pix', 'cartao', 'boleto', 'dinheiro', 'balcao', 'isento');
CREATE TYPE categoria_evento AS ENUM ('Hype', 'One Way', 'Padrão', 'Encontro', 'Acampamento', 'Conferência', 'Culto especial', 'Outro');
CREATE TYPE user_role AS ENUM ('admin', 'pastor', 'lider', 'voluntario');

-- 2. Tabela de Configuração Institucional (White Label)
CREATE TABLE igrejas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  nome         text NOT NULL,
  subtitulo    text DEFAULT 'Igreja Contemporânea em Células',
  logo_url     text,
  banner_url   text,
  tema_padrao  text NOT NULL DEFAULT 'eira-signature',
  cor_destaque text NOT NULL DEFAULT '#FACC15',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT igreja_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 3. Tabela de Eventos
CREATE TABLE eventos (
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
  rede         text NOT NULL DEFAULT 'Padrão', -- 'Hype', 'One Way', 'Padrão'
  campos       jsonb NOT NULL DEFAULT '["nome","telefone","email","nascimento","observacoes_saude"]',
  ativo        boolean NOT NULL DEFAULT true,
  imagem_url   text,
  local_nome   text DEFAULT 'Auditório Principal — Eira Church',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT slug_format     CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT vagas_positivas CHECK (vagas > 0),
  CONSTRAINT valor_positivo  CHECK (valor >= 0),
  CONSTRAINT datas_validas   CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT campos_validos  CHECK (jsonb_typeof(campos) = 'array')
);

-- 4. Tabela de Inscrições
CREATE TABLE inscricoes (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id            uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome                 text NOT NULL,
  email                text,
  telefone             text,
  nascimento           date,
  idade                integer,
  nome_responsavel     text,
  telefone_responsavel text,
  igreja               text DEFAULT 'Eira Church',
  transporte           boolean DEFAULT false,
  observacoes_saude    text, -- alergias alimentares, intolerâncias, condições médicas
  participa_celula     boolean DEFAULT false,
  nome_celula_lider    text,
  status               status_inscricao NOT NULL DEFAULT 'pendente',
  metodo_pag           metodo_pagamento,
  mp_payment_id        text,
  mp_preference_id     text,
  comprovante_hash     text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT email_format CHECK (email IS NULL OR email ~* '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT check_menor_responsavel CHECK (
    (nascimento IS NULL OR nascimento <= (CURRENT_DATE - INTERVAL '18 years'))
    OR (nome_responsavel IS NOT NULL AND telefone_responsavel IS NOT NULL)
  )
);

-- 5. Tabelas para Releases do Ecossistema (Conexão e Células)
CREATE TABLE visitantes_conexao (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  igreja_id       uuid REFERENCES igrejas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  telefone        text NOT NULL,
  email           text,
  bairro          text NOT NULL,
  cidade          text DEFAULT 'Cidade Sede',
  quem_convidou   text,
  faixa_etaria    text, -- 'Teens (12-17)', 'Jovens (18-29)', 'Adultos'
  atendido        boolean DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE celulas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  igreja_id       uuid REFERENCES igrejas(id) ON DELETE CASCADE,
  nome            text NOT NULL,
  lider_nome      text NOT NULL,
  lider_telefone  text NOT NULL,
  perfil          text NOT NULL, -- 'Hype (Teens)', 'One Way (Jovens)', 'Homens', 'Mulheres', 'Casais', 'Geral'
  bairro          text NOT NULL,
  dia_semana      text NOT NULL,
  horario         text NOT NULL,
  google_maps_url text,
  ativo           boolean DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 6. Índices de Performance
CREATE INDEX idx_eventos_ativo       ON eventos(ativo) WHERE ativo = true;
CREATE INDEX idx_eventos_slug        ON eventos(slug);
CREATE INDEX idx_eventos_data        ON eventos(data_inicio);
CREATE INDEX idx_eventos_categoria   ON eventos(categoria);
CREATE INDEX idx_inscricoes_evento   ON inscricoes(evento_id);
CREATE INDEX idx_inscricoes_status   ON inscricoes(status);
CREATE INDEX idx_inscricoes_email    ON inscricoes(email);
CREATE INDEX idx_inscricoes_mp       ON inscricoes(mp_payment_id) WHERE mp_payment_id IS NOT NULL;
CREATE INDEX idx_inscricoes_metodo   ON inscricoes(metodo_pag);

-- 7. Triggers de Atualização Automática
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER igrejas_updated_at
  BEFORE UPDATE ON igrejas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inscricoes_updated_at
  BEFORE UPDATE ON inscricoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. View Consolidada: Contagem de Inscrições e Vagas em Tempo Real
CREATE OR REPLACE VIEW eventos_com_contagem AS
  SELECT
    e.*,
    COUNT(i.id) FILTER (WHERE i.status != 'pendente') AS inscritos_confirmados,
    COUNT(i.id)                                        AS total_inscritos,
    e.vagas - COUNT(i.id) FILTER (WHERE i.status != 'pendente') AS vagas_restantes,
    COALESCE(SUM(e.valor) FILTER (WHERE i.status = 'pago'), 0) AS receita_confirmada
  FROM eventos e
  LEFT JOIN inscricoes i ON i.evento_id = e.id
  GROUP BY e.id;
