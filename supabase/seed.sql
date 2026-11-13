-- supabase/seed.sql
-- Configuração Inicial da Eira Church (Zero Dados de Teste)

-- 1. Inserir Registro Base da Igreja (Eira Church)
INSERT INTO igrejas (id, slug, nome, subtitulo, logo_url, banner_url, tema_padrao, cor_destaque)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'eira-church',
  'Eira Church',
  'Uma igreja viva, acolhedora e relevante em células.',
  '',
  '',
  'eira-signature',
  '#FACC15'
) ON CONFLICT (slug) DO NOTHING;
