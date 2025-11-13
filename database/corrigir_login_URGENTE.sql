-- ============================================
-- CORREÇÃO URGENTE DO PROBLEMA DE LOGIN
-- ============================================
-- Execute este script completo no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASSO 2: Remover função antiga e criar versão corrigida
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);

-- PASSO 3: Criar função authenticate_user CORRIGIDA
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
  -- Log para debug (aparece no console do Supabase)
  RAISE NOTICE '🔍 Tentando autenticar usuário: %', p_username;
  
  -- Validar parâmetros
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RAISE NOTICE '❌ Username vazio';
    RETURN;
  END IF;

  IF p_password IS NULL OR p_password = '' THEN
    RAISE NOTICE '❌ Password vazio';
    RETURN;
  END IF;

  -- Buscar usuário pelo username (case-sensitive)
  SELECT * INTO v_user
  FROM user_info
  WHERE user_info.username = TRIM(p_username)
  LIMIT 1;

  -- Se não encontrar usuário, retornar vazio
  IF NOT FOUND OR v_user IS NULL THEN
    RAISE NOTICE '❌ Usuário não encontrado: %', p_username;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Usuário encontrado: %', v_user.username;

  -- Verificar se o usuário tem password_hash
  IF v_user.password_hash IS NULL OR v_user.password_hash = '' THEN
    RAISE NOTICE '❌ Usuário sem senha: %', v_user.username;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Hash encontrado (tamanho: %)', LENGTH(v_user.password_hash);

  -- Verificar senha usando crypt (bcrypt)
  -- O crypt usa o salt do próprio hash para verificar
  BEGIN
    v_password_hash := crypt(p_password, v_user.password_hash);
    v_verification_result := (v_password_hash = v_user.password_hash);
    
    RAISE NOTICE '🔐 Verificação de senha: %', v_verification_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Erro ao verificar senha: %', SQLERRM;
      RETURN;
  END;
  
  -- Se a senha corresponder, retornar dados do usuário
  IF v_verification_result THEN
    RAISE NOTICE '✅ Autenticação bem-sucedida para: %', v_user.username;
    RETURN QUERY SELECT 
      v_user.id,
      v_user.username,
      v_user.email,
      v_user.name,
      v_user.avatar,
      v_user.created_at,
      v_user.updated_at,
      v_user.password_hash;
  ELSE
    RAISE NOTICE '❌ Senha incorreta para: %', v_user.username;
  END IF;

  -- Se a senha não corresponder, retornar vazio
  RETURN;
END;
$$;

-- PASSO 4: Criar função para redefinir senha (caso necessário)
CREATE OR REPLACE FUNCTION reset_user_password(
  p_username TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_info
  SET password_hash = crypt(p_new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE user_info.username = p_username;
  
  RETURN FOUND;
END;
$$;

-- PASSO 5: Verificar se há usuários sem senha e listar
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_info
  WHERE password_hash IS NULL OR password_hash = '';
  
  IF v_count > 0 THEN
    RAISE NOTICE '⚠️  ATENÇÃO: % usuários sem senha!', v_count;
    RAISE NOTICE 'Execute o comando abaixo para redefinir a senha:';
    RAISE NOTICE 'SELECT reset_user_password(''SEU_USERNAME'', ''SUA_NOVA_SENHA'');';
  ELSE
    RAISE NOTICE '✅ Todos os usuários têm senha definida';
  END IF;
END $$;

-- PASSO 6: Listar usuários para verificação
SELECT 
    username,
    name,
    email,
    CASE 
        WHEN password_hash IS NULL THEN '❌ SEM SENHA'
        WHEN password_hash = '' THEN '❌ SENHA VAZIA'
        ELSE '✅ OK'
    END as status
FROM user_info
ORDER BY username;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================
-- 1. Execute TODO este script no SQL Editor do Supabase
-- 2. Verifique a lista de usuários no final
-- 3. Se algum usuário estiver "SEM SENHA", execute:
--    SELECT reset_user_password('seu_username', 'sua_senha');
-- 4. Tente fazer login novamente no app
-- ============================================

