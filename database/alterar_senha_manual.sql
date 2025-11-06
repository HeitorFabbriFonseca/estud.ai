-- ============================================
-- ALTERAR SENHA DE USUÁRIO MANUALMENTE
-- ============================================
-- Use esta query para alterar a senha de um usuário diretamente no banco
-- ============================================

-- Opção 1: Alterar senha pelo username
UPDATE user_info
SET password_hash = hash_password('nova_senha_aqui'),
    updated_at = NOW()
WHERE username = 'nome_do_usuario';

-- Opção 2: Alterar senha pelo email
UPDATE user_info
SET password_hash = hash_password('nova_senha_aqui'),
    updated_at = NOW()
WHERE email = 'email_do_usuario@example.com';

-- Opção 3: Alterar senha pelo ID (UUID)
UPDATE user_info
SET password_hash = hash_password('nova_senha_aqui'),
    updated_at = NOW()
WHERE id = 'uuid_do_usuario_aqui';

-- ============================================
-- EXEMPLOS PRÁTICOS:
-- ============================================

-- Exemplo 1: Alterar senha do usuário "admin" para "senha123"
-- UPDATE user_info
-- SET password_hash = hash_password('senha123'),
--     updated_at = NOW()
-- WHERE username = 'admin';

-- Exemplo 2: Alterar senha do usuário pelo email
-- UPDATE user_info
-- SET password_hash = hash_password('minha_nova_senha'),
--     updated_at = NOW()
-- WHERE email = 'usuario@example.com';

-- Exemplo 3: Ver todos os usuários antes de alterar
-- SELECT id, username, email, name FROM user_info;

-- ============================================
-- IMPORTANTE:
-- ============================================
-- 1. Substitua 'nova_senha_aqui' pela senha desejada
-- 2. Substitua 'nome_do_usuario' pelo username do usuário
-- 3. A função hash_password() já deve estar criada no banco
-- 4. A senha será automaticamente hasheada com bcrypt
-- ============================================

