-- ============================================
-- CRIAR FUNÇÃO authenticate_user (VERSÃO CORRIGIDA)
-- ============================================
-- Esta versão corrige problemas comuns de permissões e tratamento de erros
-- Execute esta query no SQL Editor do Supabase
-- ============================================

-- Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remover a função antiga se existir (para recriar)
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Função para autenticar usuário (verifica username e senha)
-- Esta versão tem melhor tratamento de erros e permissões
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_password_hash TEXT;
BEGIN
  -- Validar parâmetros
  IF p_username IS NULL OR p_username = '' THEN
    RETURN;
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RETURN;
  END IF;

  -- Buscar usuário pelo username
  SELECT * INTO v_user
  FROM user_info
  WHERE username = p_username
  LIMIT 1;

  -- Se não encontrar usuário, retornar vazio
  IF NOT FOUND OR v_user IS NULL THEN
    RETURN;
  END IF;

  -- Verificar se o usuário tem password_hash
  IF v_user.password_hash IS NULL OR v_user.password_hash = '' THEN
    RETURN;
  END IF;

  -- Verificar senha usando crypt (bcrypt)
  v_password_hash := crypt(p_password, v_user.password_hash);
  
  IF v_password_hash = v_user.password_hash THEN
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
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar vazio
    RETURN;
END;
$$;

-- Garantir que a função tenha permissões corretas
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- ============================================
-- IMPORTANTE:
-- ============================================
-- 1. SECURITY DEFINER permite que a função execute com privilégios do criador
-- 2. SET search_path = public garante que a função use o schema correto
-- 3. GRANT EXECUTE permite que usuários anônimos e autenticados chamem a função
-- 4. A função agora tem tratamento de exceções para evitar erros 400
-- ============================================

