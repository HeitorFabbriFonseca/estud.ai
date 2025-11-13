-- ============================================
-- TESTE COMPLETO DO SISTEMA DE LOGIN
-- ============================================

-- 1. Ver todos os usuários
SELECT 
    username,
    name,
    email,
    password,
    CASE 
        WHEN password IS NULL OR password = '' THEN '❌ SEM SENHA'
        ELSE '✅ TEM SENHA'
    END as status
FROM user_info
ORDER BY username;

-- 2. Definir senhas para TODOS os usuários
-- (Ajuste conforme necessário)
UPDATE user_info SET password = 'senha123' WHERE password IS NULL OR password = '';

-- 3. Ver usuários novamente (com senhas)
SELECT username, name, password FROM user_info ORDER BY username;

-- 4. Testar login do primeiro usuário
-- (Substitua pelo seu username real)
SELECT * FROM authenticate_user('seu_usuario', 'senha123');

-- ============================================
-- PRONTO! Agora teste no app!
-- ============================================

