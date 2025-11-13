-- ============================================
-- SOLUÇÃO SIMPLES - SENHA SEM HASH (TEXTO PLANO)
-- ============================================
-- Para projetos de TCC ou desenvolvimento
-- Execute tudo de uma vez no Supabase SQL Editor
-- ============================================

-- 1. Remover função authenticate_user antiga
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- 2. Criar função authenticate_user SIMPLES (sem hash)
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
BEGIN
  -- Validar parâmetros
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN;
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RETURN;
  END IF;

  -- Buscar usuário pelo username
  SELECT * INTO v_user
  FROM user_info
  WHERE username = TRIM(p_username)
  LIMIT 1;

  -- Se não encontrar usuário, retornar vazio
  IF NOT FOUND OR v_user IS NULL THEN
    RETURN;
  END IF;

  -- Comparação SIMPLES de senha (texto plano)
  -- Compara diretamente sem hash
  IF v_user.password_hash = p_password THEN
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
    RETURN;
END;
$$;

-- 3. Garantir permissões
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- 4. Criar/atualizar usuário Pedro com senha em texto plano
INSERT INTO user_info (username, email, name, password_hash)
VALUES (
  'Pedro',
  'pedro@example.com',
  'Pedro',
  'senha'  -- Senha em texto plano
)
ON CONFLICT (username) 
DO UPDATE SET
  password_hash = 'senha',  -- Senha em texto plano
  updated_at = NOW();

-- 5. Verificar se está tudo correto
SELECT 
  '✅ Usuário criado/atualizado' as status,
  username,
  email,
  password_hash as senha_armazenada,
  CASE 
    WHEN password_hash IS NULL THEN '❌ SEM SENHA'
    WHEN password_hash = '' THEN '❌ SENHA VAZIA'
    ELSE '✅ TEM SENHA'
  END as status_senha
FROM user_info
WHERE username = 'Pedro';

-- 6. Testar autenticação diretamente
SELECT 
  '✅ Teste de autenticação' as status,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ FUNCIONANDO'
    ELSE '❌ FALHOU'
  END as resultado
FROM authenticate_user('Pedro', 'senha');

-- 7. Mostrar dados do usuário (para confirmar)
SELECT * FROM authenticate_user('Pedro', 'senha');

-- 8. Atualizar função change_password para funcionar sem hash
CREATE OR REPLACE FUNCTION change_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT * INTO v_user
  FROM user_info
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Comparação direta (texto plano)
  IF v_user.password_hash != p_current_password THEN
    RETURN FALSE;
  END IF;

  -- Atualizar senha (texto plano)
  UPDATE user_info
  SET password_hash = p_new_password,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION change_password(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION change_password(UUID, TEXT, TEXT) TO authenticated;

-- ============================================
-- PRONTO! Agora você pode fazer login com:
-- Username: Pedro
-- Senha: senha
-- ============================================
-- Para criar mais usuários, use:
-- INSERT INTO user_info (username, email, name, password_hash)
-- VALUES ('usuario', 'email@exemplo.com', 'Nome', 'senha123');
-- ============================================

