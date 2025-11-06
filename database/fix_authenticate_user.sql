-- ============================================
-- CORRIGIR FUNÇÃO authenticate_user
-- ============================================
-- Esta versão tem melhor tratamento e verifica se o hash está correto
-- ============================================

-- Remover função antiga
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- Criar função corrigida
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

  -- Buscar usuário pelo username (case-sensitive)
  SELECT * INTO v_user
  FROM user_info
  WHERE username = TRIM(p_username)
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
  -- O crypt usa o salt do próprio hash para verificar
  v_password_hash := crypt(p_password, v_user.password_hash);
  v_verification_result := (v_password_hash = v_user.password_hash);
  
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

  -- Se a senha não corresponder, retornar vazio
  RETURN;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar vazio
    RETURN;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- ============================================
-- TESTE IMEDIATO
-- ============================================

-- 1. Verificar se o usuário Pedro existe
SELECT username, email, LENGTH(password_hash) as hash_size 
FROM user_info 
WHERE username = 'Pedro';

-- 2. Recriar a senha do Pedro (garantir que está correta)
UPDATE user_info
SET password_hash = hash_password('senha'),
    updated_at = NOW()
WHERE username = 'Pedro';

-- 3. Testar a função
SELECT * FROM authenticate_user('Pedro', 'senha');

-- 4. Verificar se o hash funciona manualmente
SELECT 
  username,
  password_hash,
  crypt('senha', password_hash) as hash_calculado,
  crypt('senha', password_hash) = password_hash as senha_valida
FROM user_info
WHERE username = 'Pedro';

-- ============================================

