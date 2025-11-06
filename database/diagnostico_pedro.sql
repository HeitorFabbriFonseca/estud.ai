-- ============================================
-- DIAGNÓSTICO DETALHADO - USUÁRIO PEDRO
-- ============================================
-- Execute estas queries na ordem para descobrir o problema
-- ============================================

-- 1. Verificar se o usuário Pedro existe e tem senha
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
  LENGTH(password_hash) as tamanho_hash,
  LEFT(password_hash, 30) as inicio_hash,
  password_hash as hash_completo
FROM user_info
WHERE username = 'Pedro';

-- 2. Verificar se há problemas com espaços no username
SELECT 
  username,
  LENGTH(username) as tamanho,
  LENGTH(TRIM(username)) as tamanho_sem_espacos,
  username != TRIM(username) as tem_espacos,
  '|' || username || '|' as username_com_pipes
FROM user_info
WHERE username = 'Pedro';

-- 3. Testar hash manualmente
SELECT 
  hash_password('senha') as hash_gerado,
  crypt('senha', hash_password('senha')) = hash_password('senha') as deve_ser_true;

-- 4. Verificar se o hash no banco funciona
SELECT 
  username,
  password_hash as hash_no_banco,
  crypt('senha', password_hash) as hash_calculado,
  crypt('senha', password_hash) = password_hash as senha_correta
FROM user_info
WHERE username = 'Pedro';

-- 5. Testar a função authenticate_user diretamente
SELECT * FROM authenticate_user('Pedro', 'senha');

-- 6. Testar com diferentes variações (caso haja problema de case)
SELECT * FROM authenticate_user('pedro', 'senha');  -- minúsculo
SELECT * FROM authenticate_user('PEDRO', 'senha');  -- maiúsculo
SELECT * FROM authenticate_user('Pedro', 'Senha');  -- senha com maiúscula
SELECT * FROM authenticate_user(TRIM('Pedro'), 'senha');  -- sem espaços

-- 7. Recriar a senha do zero (garantir que está correto)
UPDATE user_info
SET password_hash = hash_password('senha'),
    updated_at = NOW()
WHERE username = 'Pedro';

-- 8. Verificar novamente após recriar
SELECT 
  username,
  LENGTH(password_hash) as tamanho_hash,
  LEFT(password_hash, 30) as inicio_hash,
  crypt('senha', password_hash) = password_hash as senha_valida
FROM user_info
WHERE username = 'Pedro';

-- 9. Testar novamente a função
SELECT * FROM authenticate_user('Pedro', 'senha');

-- ============================================
-- VERIFICAR SE A FUNÇÃO ESTÁ CORRETA
-- ============================================

-- Ver a definição da função
SELECT 
  p.proname as nome_funcao,
  pg_get_functiondef(p.oid) as definicao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'authenticate_user';

-- ============================================

