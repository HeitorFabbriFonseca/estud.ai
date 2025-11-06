-- PASSO 2: Execute esta query DEPOIS de executar o arquivo 01_add_password_column.sql
-- Exemplos de como inserir usuários manualmente:

-- Exemplo 1: Inserir um único usuário
INSERT INTO user_info (username, email, name, password_hash, avatar)
VALUES (
  'usuario1',
  'usuario1@example.com',
  'Nome do Usuário',
  hash_password('senha123'),
  NULL
);

-- Exemplo 2: Inserir múltiplos usuários de uma vez
INSERT INTO user_info (username, email, name, password_hash) VALUES
  ('user1', 'user1@example.com', 'Usuário 1', hash_password('senha123')),
  ('user2', 'user2@example.com', 'Usuário 2', hash_password('senha456')),
  ('user3', 'user3@example.com', 'Usuário 3', hash_password('senha789'));

