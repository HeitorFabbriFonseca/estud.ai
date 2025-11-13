-- ============================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE LOGIN
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se a extensão pgcrypto está habilitada
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
-- Se não retornar nada, a extensão não está instalada!

-- 2. Verificar se a função authenticate_user existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'authenticate_user'
AND routine_schema = 'public';
-- Se não retornar nada, a função não existe!

-- 3. Listar todos os usuários e verificar password_hash
SELECT 
    username,
    name,
    email,
    CASE 
        WHEN password_hash IS NULL THEN '❌ NULL'
        WHEN password_hash = '' THEN '❌ VAZIO'
        WHEN LENGTH(password_hash) < 20 THEN '❌ HASH INVÁLIDO (muito curto)'
        ELSE '✅ OK (hash presente)'
    END as status_senha,
    LENGTH(password_hash) as tamanho_hash,
    LEFT(password_hash, 10) || '...' as preview_hash
FROM user_info
ORDER BY username;

-- 4. Testar a função crypt diretamente (se pgcrypto estiver habilitado)
-- Teste básico: criar um hash e verificar
DO $$
DECLARE
    v_test_password TEXT := 'teste123';
    v_test_hash TEXT;
    v_verification_result BOOLEAN;
BEGIN
    -- Criar hash
    v_test_hash := crypt(v_test_password, gen_salt('bf'));
    RAISE NOTICE '🔐 Hash de teste criado: %', v_test_hash;
    
    -- Verificar hash
    v_verification_result := (crypt(v_test_password, v_test_hash) = v_test_hash);
    RAISE NOTICE '✅ Verificação de teste: %', v_verification_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao testar crypt: %', SQLERRM;
END $$;

-- 5. Verificar permissões da tabela user_info
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'user_info';

-- 6. Testar a função authenticate_user com um usuário específico
-- IMPORTANTE: Substitua 'seu_usuario' e 'sua_senha' pelos valores reais!
DO $$
DECLARE
    v_result RECORD;
BEGIN
    RAISE NOTICE '🔍 Testando autenticação...';
    
    -- Tentar autenticar (ajuste username e senha aqui)
    FOR v_result IN 
        SELECT * FROM authenticate_user('seu_usuario', 'sua_senha')
    LOOP
        RAISE NOTICE '✅ Usuário autenticado: %', v_result.username;
        RETURN;
    END LOOP;
    
    RAISE NOTICE '❌ Autenticação falhou - função retornou vazio';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro na função: %', SQLERRM;
END $$;

