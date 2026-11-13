-- supabase/migrations/003_rls.sql
-- Sistema de Gestão de Eventos — Eira Church (Row Level Security & Permissões)

-- 1. Habilitar RLS em 100% das Tabelas
ALTER TABLE igrejas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricoes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscricao_tentativas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitantes_conexao    ENABLE ROW LEVEL SECURITY;
ALTER TABLE celulas               ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'igrejas'
CREATE POLICY "igrejas_publico_leitura"
  ON igrejas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "igrejas_admin_total"
  ON igrejas FOR ALL
  TO authenticated
  USING      (auth.jwt() ->> 'role' IN ('admin', 'pastor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'pastor'));

-- 3. Políticas para 'eventos'
-- Público pode ler apenas eventos ativos
CREATE POLICY "eventos_publico_leitura"
  ON eventos FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

-- Administradores, Pastores e Líderes possuem controle e gestão sobre eventos
CREATE POLICY "eventos_admin_total"
  ON eventos FOR ALL
  TO authenticated
  USING      (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'));

-- 4. Políticas para 'inscricoes'
-- O público NÃO possui permissão de leitura na tabela de inscrições (proteção de dados LGPD)
-- O público pode APENAS inserir novas inscrições, validando:
--   a) Evento existe e está ativo
--   b) Há vagas restantes disponíveis no momento da submissão
CREATE POLICY "inscricoes_publico_inserir"
  ON inscricoes FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM eventos
      WHERE id = evento_id AND ativo = true
    )
    AND (
      SELECT COALESCE(vagas_restantes, 0)
      FROM eventos_com_contagem
      WHERE id = evento_id
    ) > 0
  );

-- Administradores, Pastores e Líderes de Célula possuem acesso à lista de inscritos, métricas e gestão
CREATE POLICY "inscricoes_admin_total"
  ON inscricoes FOR ALL
  TO authenticated
  USING      (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'));

-- 5. Políticas para 'inscricao_tentativas' (Rate Limiting)
CREATE POLICY "tentativas_inserir_publico"
  ON inscricao_tentativas FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "tentativas_admin_select"
  ON inscricao_tentativas FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pastor'));

-- 6. Políticas para 'visitantes_conexao' e 'celulas' (Releases 1.1 e 1.2)
CREATE POLICY "visitantes_inserir_publico"
  ON visitantes_conexao FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "visitantes_admin_total"
  ON visitantes_conexao FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'));

CREATE POLICY "celulas_publico_leitura"
  ON celulas FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

CREATE POLICY "celulas_admin_total"
  ON celulas FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'pastor', 'lider'));
