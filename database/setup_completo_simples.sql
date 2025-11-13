-- ============================================
-- SETUP COMPLETO - LOGIN SIMPLES (SEM HASH)
-- ============================================
-- Prova de conceito - Senha em texto simples
-- Execute TODO este script no SQL Editor do Supabase
-- ============================================

-- PASSO 1: Remover TODAS as funções antigas
DROP FUNCTION IF EXISTS authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS reset_user_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS change_password(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS hash_password(TEXT);

-- PASSO 2: Garantir que a coluna password existe (senha em texto simples)
-- Se já existir, não faz nada
ALTER TABLE user_info ADD COLUMN IF NOT EXISTS password TEXT;

-- PASSO 3: Criar função de autenticação SIMPLES
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
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Buscar usuário e comparar senha (simples)
  SELECT 
    u.id,
    u.username,
    u.email,
    u.name,
    u.avatar,
    u.created_at,
    u.updated_at
  INTO v_user
  FROM user_info u
  WHERE u.username = TRIM(p_username)
  AND u.password = p_password
  LIMIT 1;

  -- Se encontrou, retornar dados
  IF FOUND THEN
    RETURN QUERY SELECT 
      v_user.id,
      v_user.username,
      v_user.email,
      v_user.name,
      v_user.avatar,
      v_user.created_at,
      v_user.updated_at;
  END IF;

  RETURN;
END;
$$;

-- PASSO 4: Dar permissões
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT) TO service_role;

-- PASSO 5: Listar usuários atuais
SELECT 
    username,
    name,
    email,
    password,
    CASE 
        WHEN password IS NULL OR password = '' THEN '❌ SEM SENHA'
        ELSE '✅ OK'
    END as status
FROM user_info
ORDER BY username;

-- ============================================
-- INSTRUÇÕES DE USO:
-- ============================================

-- Para criar/atualizar senha de um usuário:
-- UPDATE user_info SET password = 'sua_senha' WHERE username = 'seu_usuario';

-- Para criar um novo usuário:
-- INSERT INTO user_info (username, name, email, password)
-- VALUES ('novo_usuario', 'Nome Completo', 'email@email.com', 'senha123');

-- Para testar o login:
-- SELECT * FROM authenticate_user('seu_usuario', 'sua_senha');

-- ============================================
-- FIM DO SCRIPT
-- ============================================

