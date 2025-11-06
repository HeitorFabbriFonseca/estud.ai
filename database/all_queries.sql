-- ============================================
-- QUERIES COMPLETAS PARA O ESTUDAI
-- ============================================
-- Execute estas queries no SQL Editor do Supabase na ordem apresentada
-- ============================================

-- 1. Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Adicionar coluna password_hash na tabela user_info (se não existir)
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

-- 3. Função para criar hash de senha (usar ao criar usuários)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- 4. Função para alterar senha do usuário
-- Verifica a senha atual antes de permitir a alteração
CREATE OR REPLACE FUNCTION change_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user RECORD;
  v_new_password_hash TEXT;
BEGIN
  -- Buscar usuário pelo ID
  SELECT * INTO v_user
  FROM user_info
  WHERE id = p_user_id;

  -- Se não encontrar usuário, retornar false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Verificar se a senha atual está correta
  IF crypt(p_current_password, v_user.password_hash) != v_user.password_hash THEN
    RETURN FALSE;
  END IF;

  -- Gerar hash da nova senha
  v_new_password_hash := crypt(p_new_password, gen_salt('bf'));

  -- Atualizar a senha
  UPDATE user_info
  SET password_hash = v_new_password_hash,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Retornar true se a atualização foi bem-sucedida
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OBSERVAÇÕES:
-- ============================================
-- 1. A função change_password já está implementada no código
-- 2. A função hash_password é usada para criar usuários manualmente
-- 3. Todas as outras funcionalidades (deletar chat, editar título, etc.)
--    usam operações diretas do Supabase que não requerem funções SQL adicionais
-- 4. O CASCADE já está configurado no schema.sql para deletar mensagens
--    quando um chat é deletado
-- ============================================

