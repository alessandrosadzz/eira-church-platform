-- supabase/seed.sql
-- Dados Iniciais e de Demonstração para Desenvolvimento e Testes — Eira Church

-- 1. Inserir Igreja Principal (Eira Church)
INSERT INTO igrejas (id, slug, nome, subtitulo, logo_url, banner_url, tema_padrao, cor_destaque)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'eira-church',
  'Eira Church',
  'Uma igreja relevante, acolhedora e contemporânea em células.',
  'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  'eira-signature',
  '#FACC15'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Inserir Eventos Oficiais das Redes Hype, One Way e Padrão
INSERT INTO eventos (id, igreja_id, slug, nome, descricao, data_inicio, data_fim, vagas, valor, categoria, rede, campos, ativo, imagem_url, local_nome)
VALUES
(
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'retiro-hype-mar-2025',
  'Retiro Hype // Intensidade & Propósito',
  'Três dias imersivos de comunhão, música, esportes e transformação para adolescentes e teens de 12 a 17 anos. Hospedagem e alimentação inclusas.',
  '2025-03-21', '2025-03-23', 80, 150.00,
  'Acampamento', 'Hype',
  '["nome","nascimento","telefone","email","observacoes_saude","transporte"]',
  true,
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
  'Sítio das Palmeiras — Vale Verde'
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'conferencia-one-way-mai-2025',
  'Conferência One Way // Identidade',
  'Uma noite marcante de louvor e palavra para a juventude e universitários da Eira Church e convidados. Entrada gratuita com vagas limitadas.',
  '2025-05-17', NULL, 250, 0.00,
  'Conferência', 'One Way',
  '["nome","email","telefone","nascimento"]',
  true,
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  'Auditório Principal — Eira Church'
),
(
  '22222222-2222-2222-2222-222222222223',
  '11111111-1111-1111-1111-111111111111',
  'encontro-familias-jul-2025',
  'Encontro de Casais & Famílias Eira',
  'Fim de semana especial dedicado ao fortalecimento dos lares, comunhão conjugal e atividades recreativas para toda a família.',
  '2025-07-18', '2025-07-20', 60, 220.00,
  'Encontro', 'Padrão',
  '["nome","email","telefone","observacoes_saude"]',
  true,
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  'Recanto Moriah — Serra Azul'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Inserir Inscrições de Demonstração (com múltiplos métodos e menor de idade)
INSERT INTO inscricoes (id, evento_id, nome, email, telefone, nascimento, nome_responsavel, telefone_responsavel, observacoes_saude, status, metodo_pag, created_at)
VALUES
(
  '33333333-3333-3333-3333-333333333331',
  '22222222-2222-2222-2222-222222222221',
  'Lucas Albuquerque',
  'lucas.alb@gmail.com',
  '(47) 99871-2233',
  '2010-04-12', -- 14 anos (Menor de idade)
  'Patrícia Albuquerque (Mãe)',
  '(47) 99988-1122',
  'Intolerância a lactose e rinite alérgica.',
  'pago', 'pix',
  now() - INTERVAL '2 days'
),
(
  '33333333-3333-3333-3333-333333333332',
  '22222222-2222-2222-2222-222222222221',
  'Guilherme Santos',
  'gui.santos@outlook.com',
  '(47) 98844-3322',
  '2009-08-25', -- 15 anos
  'Roberto Santos (Pai)',
  '(47) 98877-6655',
  NULL,
  'pago', 'dinheiro', -- Pago no balcão da secretaria
  now() - INTERVAL '1 day'
),
(
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  'Mateus Fernandes',
  'mateus.fernandes@gmail.com',
  '(47) 99123-4567',
  '2002-11-03', -- 22 anos
  NULL, NULL, NULL,
  'isento', 'isento', -- Evento gratuito
  now() - INTERVAL '5 hours'
),
(
  '33333333-3333-3333-3333-333333333334',
  '22222222-2222-2222-2222-222222222223',
  'Carlos Eduardo & Renata Lima',
  'carlos.lima@empresa.com.br',
  '(47) 99234-5678',
  '1988-06-15',
  NULL, NULL,
  'Sem restrições alimentares.',
  'pendente', NULL, -- Aguardando pagamento
  now() - INTERVAL '30 minutes'
) ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Células de Exemplo (Release 1.2)
INSERT INTO celulas (igreja_id, nome, lider_nome, lider_telefone, perfil, bairro, dia_semana, horario, google_maps_url)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Célula Hype Alpha (Teens)',
  'Felipe & Larissa Rocha',
  '(47) 99777-1122',
  'Hype (Teens)',
  'Centro',
  'Sexta-feira',
  '19:30',
  'https://maps.google.com/?q=-26.915,-49.071'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Célula One Way Roots (Jovens)',
  'Gabriel Oliveira',
  '(47) 99666-3344',
  'One Way (Jovens)',
  'Vila Nova',
  'Quarta-feira',
  '20:00',
  'https://maps.google.com/?q=-26.905,-49.082'
);
