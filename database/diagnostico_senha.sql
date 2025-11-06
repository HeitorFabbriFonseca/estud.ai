-- ============================================
-- DIAGNÓSTICO DE PROBLEMAS COM SENHA
-- ============================================
-- Execute estas queries para diagnosticar problemas de autenticação
-- ============================================

-- 1. Ver todos os usuários e verificar se têm password_hash
SELECT 
  id,
  username,
  email,
  name,
  CASE 
    WHEN password_hash IS NULL THEN 'SEM SENHA'
    WHEN password_hash = '' THEN 'SENHA VAZIA'
    ELSE 'TEM SENHA'
  END as status_senha,
  LENGTH(password_hash) as tamanho_hash,
  LEFT(password_hash, 10) as inicio_hash
FROM user_info;

-- 2. Verificar um usuário específico (substitua 'username_aqui' pelo username)
-- SELECT 
--   id,
--   username,
--   email,
--   password_hash,
--   LENGTH(password_hash) as tamanho_hash
-- FROM user_info
-- WHERE username = 'username_aqui';

-- 3. Testar a função authenticate_user diretamente (substitua os valores)
-- SELECT * FROM authenticate_user('username_aqui', 'senha_aqui');

-- 4. Verificar se a extensão pgcrypto está habilitada
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- 5. Testar hash de senha manualmente
-- SELECT hash_password('teste123') as hash_gerado;

-- ============================================
-- SOLUÇÃO: Recriar senha para um usuário
-- ============================================

-- Se o usuário não tem senha ou a senha está incorreta, use esta query:
-- UPDATE user_info
-- SET password_hash = hash_password('nova_senha_aqui'),
--     updated_at = NOW()
-- WHERE username = 'username_do_usuario';

-- ============================================
-- TESTE COMPLETO DE AUTENTICAÇÃO
-- ============================================

-- 1. Primeiro, verifique se o usuário existe:
-- SELECT username, email FROM user_info WHERE username = 'seu_username';

-- 2. Verifique se tem password_hash:
-- SELECT username, password_hash IS NOT NULL as tem_senha 
-- FROM user_info WHERE username = 'seu_username';

-- 3. Se não tiver senha, crie uma:
-- UPDATE user_info 
-- SET password_hash = hash_password('sua_senha'),
--     updated_at = NOW()
-- WHERE username = 'seu_username';

-- 4. Teste a autenticação:
-- SELECT * FROM authenticate_user('seu_username', 'sua_senha');

-- ============================================

