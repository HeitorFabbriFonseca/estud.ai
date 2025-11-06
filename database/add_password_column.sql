-- Habilitar extensão pgcrypto (necessária para hash de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna password_hash na tabela user_info (caso não exista)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'user_info' 
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE user_info ADD COLUMN password_hash TEXT;
    -- Se a tabela já tiver dados, você precisará atualizar os registros existentes
    -- UPDATE user_info SET password_hash = hash_password('senha_temporaria') WHERE password_hash IS NULL;
    -- Depois, se quiser tornar obrigatório:
    -- ALTER TABLE user_info ALTER COLUMN password_hash SET NOT NULL;
  END IF;
END $$;

-- Função para criar hash de senha (usar ao criar usuários)
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Exemplo de como inserir usuários manualmente:
-- INSERT INTO user_info (username, email, name, password_hash, avatar)
-- VALUES (
--   'usuario1',
--   'usuario1@example.com',
--   'Nome do Usuário',
--   hash_password('senha123'),
--   NULL
-- );

-- Exemplo de inserção múltipla:
-- INSERT INTO user_info (username, email, name, password_hash) VALUES
--   ('user1', 'user1@example.com', 'Usuário 1', hash_password('senha123')),
--   ('user2', 'user2@example.com', 'Usuário 2', hash_password('senha456')),
--   ('user3', 'user3@example.com', 'Usuário 3', hash_password('senha789'));

