-- ============================================
-- CRIAR USUÁRIO 'Pedro' COM SENHA 'senha'
-- ============================================

-- Criar usuário Pedro com senha hasheada
INSERT INTO user_info (username, email, name, password_hash)
VALUES (
  'Pedro',
  'pedro@example.com',
  'Pedro',
  hash_password('senha')
)
ON CONFLICT (username) DO UPDATE
SET 
  password_hash = hash_password('senha'),
  updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT 
  id,
  username,
  email,
  name,
  CASE 
    WHEN password_hash IS NULL THEN '❌ SEM SENHA'
    WHEN password_hash = '' THEN '❌ SENHA VAZIA'
    ELSE '✅ TEM SENHA'
  END as status_senha,
  LEFT(password_hash, 20) as inicio_hash
FROM user_info
WHERE username = 'Pedro';

-- Testar autenticação
SELECT * FROM authenticate_user('Pedro', 'senha');

-- ============================================
-- Se quiser criar com outros dados, use:
-- ============================================

-- INSERT INTO user_info (username, email, name, password_hash)
-- VALUES (
--   'Pedro',
--   'pedro@exemplo.com',  -- Substitua pelo email desejado
--   'Pedro Silva',        -- Substitua pelo nome desejado
--   hash_password('senha')
-- )
-- ON CONFLICT (username) DO UPDATE
-- SET 
--   password_hash = hash_password('senha'),
--   updated_at = NOW();

