-- ============================================
-- VERIFICAR USUÁRIO ATUAL E STATUS DA SENHA
-- ============================================
-- Execute estas queries para verificar o status do seu usuário
-- ============================================

-- 1. Ver TODOS os usuários e status das senhas
SELECT 
  id,
  username,
  email,
  name,
  CASE 
    WHEN password_hash IS NULL THEN '❌ SEM SENHA - Precisa criar'
    WHEN password_hash = '' THEN '❌ SENHA VAZIA - Precisa criar'
    ELSE '✅ TEM SENHA HASHEADA'
  END as status_senha,
  LENGTH(password_hash) as tamanho_hash,
  LEFT(password_hash, 20) as inicio_hash,
  created_at,
  updated_at
FROM user_info
ORDER BY created_at DESC;

-- 2. Verificar um usuário específico (SUBSTITUA 'username_aqui' pelo seu username)
-- SELECT 
--   username,
--   email,
--   CASE 
--     WHEN password_hash IS NULL THEN '❌ SEM SENHA'
--     WHEN password_hash = '' THEN '❌ SENHA VAZIA'
--     ELSE '✅ TEM SENHA'
--   END as status,
--   LENGTH(password_hash) as tamanho_hash,
--   LEFT(password_hash, 30) as inicio_hash
-- FROM user_info
-- WHERE username = 'username_aqui';

-- 3. Se o usuário NÃO tem senha ou a senha está incorreta, RECRIAR:
-- IMPORTANTE: Substitua os valores abaixo pelos seus valores reais
-- UPDATE user_info
-- SET password_hash = hash_password('sua_senha_aqui'),
--     updated_at = NOW()
-- WHERE username = 'seu_username_aqui';

-- 4. Depois de recriar a senha, TESTAR a autenticação:
-- SELECT * FROM authenticate_user('seu_username_aqui', 'sua_senha_aqui');

-- ============================================
-- TESTE DE HASH (para verificar se hash_password funciona)
-- ============================================
-- SELECT hash_password('teste123') as hash_gerado;

-- ============================================
-- VERIFICAR SE HÁ PROBLEMA COM ESPAÇOS
-- ============================================
-- SELECT 
--   username,
--   LENGTH(username) as tamanho_username,
--   LENGTH(TRIM(username)) as tamanho_sem_espacos,
--   username != TRIM(username) as tem_espacos
-- FROM user_info
-- WHERE username = 'seu_username_aqui';

-- ============================================

