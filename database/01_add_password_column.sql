-- PASSO 1: Execute esta query PRIMEIRO no Supabase SQL Editor
-- Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna password_hash na tabela user_info (se não existir)
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

-- Criar função para gerar hash de senha
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

