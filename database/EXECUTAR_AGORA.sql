-- ============================================
-- ⚡ EXECUTAR ESTE SCRIPT AGORA NO SUPABASE
-- ============================================
-- Cole TODO este código no SQL Editor e clique em RUN
-- ============================================

-- Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remover função antiga
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Criar função corrigida (SEM ambiguidade)
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
  v_verification_result BOOLEAN;
BEGIN
  -- Validar parâmetros
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN;
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RETURN;
  END IF;

  -- Buscar usuário pelo username (SEM ambiguidade)
  SELECT * INTO v_user
  FROM user_info
  WHERE user_info.username = TRIM(p_username)  -- ⚡ CORRIGIDO AQUI
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
  BEGIN
    v_password_hash := crypt(p_password, v_user.password_hash);
    v_verification_result := (v_password_hash = v_user.password_hash);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN;
  END;
  
  -- Se a senha corresponder, retornar dados do usuário
  IF v_verification_result THEN
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

  RETURN;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- ============================================
-- ✅ PRONTO! Agora teste o login no app!
-- ============================================

-- Para verificar se funcionou, execute:
-- SELECT * FROM authenticate_user('seu_username', 'sua_senha');

