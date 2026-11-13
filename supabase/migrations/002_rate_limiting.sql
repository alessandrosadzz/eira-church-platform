-- supabase/migrations/002_rate_limiting.sql
-- Sistema de Gestão de Eventos — Eira Church (Proteção Anti-Spam e Rate Limiting)

CREATE TABLE inscricao_tentativas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  ip_hash    text NOT NULL,   -- SHA-256 do IP do cliente (sem persistir IP puro para compliance LGPD)
  email      text,
  created_at timestamptz DEFAULT now()
);

-- Índice composto de alta performance para validação temporal
CREATE INDEX idx_tentativas_ip_evento_time
  ON inscricao_tentativas(ip_hash, evento_id, created_at);

-- Função de Segurança: Limita a no máximo 3 tentativas de submissão por par IP/evento por hora
CREATE OR REPLACE FUNCTION check_rate_limit(p_ip_hash text, p_evento_id uuid)
RETURNS boolean AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM inscricao_tentativas
  WHERE ip_hash = p_ip_hash
    AND evento_id = p_evento_id
    AND created_at > (now() - INTERVAL '1 hour');

  RETURN v_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função auxiliar para registrar tentativa
CREATE OR REPLACE FUNCTION registrar_tentativa(p_ip_hash text, p_evento_id uuid, p_email text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO inscricao_tentativas (evento_id, ip_hash, email)
  VALUES (p_evento_id, p_ip_hash, p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
