-- ============================================
-- CRIAR FUNÇÃO authenticate_user
-- ============================================
-- Esta função é ESSENCIAL para o login funcionar!
-- Execute esta query no SQL Editor do Supabase
-- ============================================

-- Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para autenticar usuário (verifica username e senha)
CREATE OR REPLACE FUNCTION authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  password_hash TEXT
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Buscar usuário pelo username
  SELECT * INTO v_user
  FROM user_info
  WHERE username = p_username;

  -- Se não encontrar usuário, retornar vazio
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Verificar senha usando crypt (bcrypt)
  IF crypt(p_password, v_user.password_hash) = v_user.password_hash THEN
    RETURN QUERY SELECT 
      v_user.id,
      v_user.username,
      v_user.email,
      v_user.name,
      v_user.avatar,
      v_user.created_at,
      v_user.updated_at,
      v_user.password_hash;
  END IF;

  -- Se a senha não corresponder, retornar vazio
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- IMPORTANTE:
-- ============================================
-- 1. Esta função é chamada pelo código quando você faz login
-- 2. Ela verifica se o username e senha estão corretos
-- 3. Retorna os dados do usuário se a autenticação for bem-sucedida
-- 4. SECURITY DEFINER permite que a função execute com privilégios do criador
-- ============================================

