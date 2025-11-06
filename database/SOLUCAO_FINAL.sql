-- ============================================
-- SOLUÇÃO DEFINITIVA - EXECUTE TUDO DE UMA VEZ
-- ============================================
-- Este arquivo resolve todos os problemas de autenticação
-- Execute tudo de uma vez no Supabase SQL Editor
-- ============================================

-- 1. Garantir que a extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Garantir que a coluna password_hash existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_info' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE user_info ADD COLUMN password_hash TEXT;
  END IF;
END $$;

-- 3. Criar/atualizar função hash_password
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- 4. Remover função authenticate_user antiga
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- 5. Criar função authenticate_user CORRIGIDA
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
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN;
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RETURN;
  END IF;

  -- Buscar usuário pelo username (case-sensitive, sem espaços)
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
  
  -- Se a senha corresponder, retornar dados do usuário
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

-- 6. Garantir permissões corretas
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- 7. Criar/atualizar usuário Pedro com senha correta
INSERT INTO user_info (username, email, name, password_hash)
VALUES (
  'Pedro',
  'pedro@example.com',
  'Pedro',
  hash_password('senha')
)
ON CONFLICT (username) 
DO UPDATE SET
  password_hash = hash_password('senha'),
  updated_at = NOW();

-- 8. Verificar se está tudo correto
SELECT 
  '✅ Usuário criado/atualizado' as status,
  username,
  email,
  CASE 
    WHEN password_hash IS NULL THEN '❌ SEM SENHA'
    WHEN password_hash = '' THEN '❌ SENHA VAZIA'
    ELSE '✅ TEM SENHA'
  END as status_senha,
  LENGTH(password_hash) as tamanho_hash
FROM user_info
WHERE username = 'Pedro';

-- 9. Testar autenticação diretamente
SELECT 
  '✅ Teste de autenticação' as status,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ FUNCIONANDO - Usuário autenticado'
    ELSE '❌ FALHOU - Senha ou usuário incorreto'
  END as resultado
FROM authenticate_user('Pedro', 'senha');

-- 10. Mostrar dados do usuário (para confirmar)
SELECT * FROM authenticate_user('Pedro', 'senha');

-- ============================================
-- PRONTO! Agora você pode fazer login com:
-- Username: Pedro
-- Senha: senha
-- ============================================

