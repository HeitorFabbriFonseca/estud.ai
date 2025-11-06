-- ============================================
-- TESTE DE AUTENTICAÇÃO - PASSO A PASSO
-- ============================================
-- Execute estas queries na ordem para diagnosticar o problema
-- ============================================

-- PASSO 1: Verificar se o usuário existe e qual é o username exato
SELECT id, username, email, name 
FROM user_info;

-- PASSO 2: Verificar se o usuário tem password_hash
SELECT 
  username,
  CASE 
    WHEN password_hash IS NULL THEN '❌ SEM SENHA - Precisa criar senha'
    WHEN password_hash = '' THEN '❌ SENHA VAZIA - Precisa criar senha'
    ELSE '✅ TEM SENHA HASHEADA'
  END as status,
  LENGTH(password_hash) as tamanho_hash
FROM user_info
WHERE username = 'seu_username_aqui'; -- SUBSTITUA pelo seu username

-- PASSO 3: Se não tiver senha, criar uma nova senha
-- IMPORTANTE: Substitua 'seu_username' e 'sua_senha' pelos valores corretos
UPDATE user_info
SET password_hash = hash_password('sua_senha_aqui'),
    updated_at = NOW()
WHERE username = 'seu_username_aqui';

-- PASSO 4: Verificar se a senha foi criada corretamente
SELECT 
  username,
  password_hash IS NOT NULL as tem_hash,
  LENGTH(password_hash) as tamanho_hash,
  LEFT(password_hash, 15) as inicio_hash
FROM user_info
WHERE username = 'seu_username_aqui';

-- PASSO 5: Testar a função authenticate_user diretamente
-- Substitua 'seu_username' e 'sua_senha' pelos valores corretos
SELECT * FROM authenticate_user('seu_username_aqui', 'sua_senha_aqui');

-- Se retornar dados = senha CORRETA ✅
-- Se retornar vazio = senha INCORRETA ou usuário não existe ❌

-- ============================================
-- PROBLEMA COMUM: Senha com espaços ou encoding
-- ============================================

-- Se a autenticação não funcionar, pode ser problema de espaços:
-- Tente recriar a senha garantindo que não há espaços:

-- UPDATE user_info
-- SET password_hash = hash_password(TRIM('sua_senha')),
--     updated_at = NOW()
-- WHERE username = TRIM('seu_username');

-- ============================================
-- VERIFICAR SE A FUNÇÃO ESTÁ FUNCIONANDO
-- ============================================

-- Teste com valores conhecidos:
-- 1. Crie um hash de teste
-- SELECT hash_password('teste123') as hash;

-- 2. Verifique se o hash funciona
-- SELECT crypt('teste123', hash_password('teste123')) = hash_password('teste123') as deve_ser_true;

-- ============================================

