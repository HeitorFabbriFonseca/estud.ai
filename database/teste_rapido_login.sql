-- ============================================
-- TESTE RÁPIDO DE LOGIN
-- ============================================
-- Este script faz um teste completo do sistema de login
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Listar todos os usuários
\echo '═══════════════════════════════════════'
\echo '1. USUÁRIOS CADASTRADOS:'
\echo '═══════════════════════════════════════'

SELECT 
    username,
    name,
    email,
    CASE 
        WHEN password_hash IS NULL THEN '❌ SEM SENHA'
        WHEN password_hash = '' THEN '❌ SENHA VAZIA'
        WHEN LENGTH(password_hash) < 20 THEN '❌ HASH INVÁLIDO'
        ELSE '✅ OK'
    END as status_senha,
    created_at
FROM user_info
ORDER BY username;

-- 2. Verificar se a extensão pgcrypto está habilitada
\echo ''
\echo '═══════════════════════════════════════'
\echo '2. EXTENSÃO PGCRYPTO:'
\echo '═══════════════════════════════════════'

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto')
        THEN '✅ INSTALADA'
        ELSE '❌ NÃO INSTALADA'
    END as status_pgcrypto;

-- 3. Verificar se a função authenticate_user existe
\echo ''
\echo '═══════════════════════════════════════'
\echo '3. FUNÇÃO AUTHENTICATE_USER:'
\echo '═══════════════════════════════════════'

SELECT 
    routine_name,
    CASE 
        WHEN routine_name = 'authenticate_user'
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM information_schema.routines 
WHERE routine_name = 'authenticate_user'
AND routine_schema = 'public'
UNION ALL
SELECT 
    'authenticate_user',
    '❌ NÃO EXISTE'
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'authenticate_user'
    AND routine_schema = 'public'
);

-- 4. Testar autenticação com um usuário
-- ⚠️ IMPORTANTE: EDITE O USERNAME E SENHA ABAIXO!
\echo ''
\echo '═══════════════════════════════════════'
\echo '4. TESTE DE AUTENTICAÇÃO:'
\echo '═══════════════════════════════════════'
\echo 'IMPORTANTE: Edite o username e senha abaixo!'
\echo ''

-- EDITE AQUI: Substitua 'seu_username' e 'sua_senha'
DO $$
DECLARE
    v_test_username TEXT := 'seu_username'; -- ⚠️ ALTERE AQUI
    v_test_password TEXT := 'sua_senha';    -- ⚠️ ALTERE AQUI
    v_result RECORD;
    v_found BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Testando login com:';
    RAISE NOTICE '  Username: %', v_test_username;
    RAISE NOTICE '  Senha: [%] caracteres', LENGTH(v_test_password);
    RAISE NOTICE '';
    
    FOR v_result IN 
        SELECT * FROM authenticate_user(v_test_username, v_test_password)
    LOOP
        v_found := TRUE;
        RAISE NOTICE '✅ SUCESSO! Autenticação funcionou!';
        RAISE NOTICE '   ID: %', v_result.id;
        RAISE NOTICE '   Username: %', v_result.username;
        RAISE NOTICE '   Nome: %', v_result.name;
        RAISE NOTICE '   Email: %', v_result.email;
    END LOOP;
    
    IF NOT v_found THEN
        RAISE NOTICE '❌ FALHA! A função retornou vazio.';
        RAISE NOTICE '';
        RAISE NOTICE 'Possíveis causas:';
        RAISE NOTICE '  1. Username ou senha incorretos';
        RAISE NOTICE '  2. Usuário não tem senha definida';
        RAISE NOTICE '  3. Você não editou o username/senha acima';
        RAISE NOTICE '';
        RAISE NOTICE 'Para redefinir a senha, execute:';
        RAISE NOTICE 'SELECT reset_user_password(''%'', ''nova_senha'');', v_test_username;
    END IF;
END $$;

-- 5. Resumo e próximos passos
\echo ''
\echo '═══════════════════════════════════════'
\echo '5. RESUMO E PRÓXIMOS PASSOS:'
\echo '═══════════════════════════════════════'

DO $$
DECLARE
    v_has_pgcrypto BOOLEAN;
    v_has_function BOOLEAN;
    v_users_without_password INTEGER;
    v_total_issues INTEGER := 0;
BEGIN
    -- Verificar pgcrypto
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto')
    INTO v_has_pgcrypto;
    
    -- Verificar função
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'authenticate_user'
        AND routine_schema = 'public'
    ) INTO v_has_function;
    
    -- Contar usuários sem senha
    SELECT COUNT(*) INTO v_users_without_password
    FROM user_info
    WHERE password_hash IS NULL OR password_hash = '';
    
    -- Exibir resultados
    RAISE NOTICE '📊 DIAGNÓSTICO GERAL:';
    RAISE NOTICE '';
    
    IF NOT v_has_pgcrypto THEN
        RAISE NOTICE '❌ pgcrypto NÃO instalada';
        RAISE NOTICE '   Solução: Execute database/corrigir_login_URGENTE.sql';
        v_total_issues := v_total_issues + 1;
    ELSE
        RAISE NOTICE '✅ pgcrypto instalada';
    END IF;
    
    IF NOT v_has_function THEN
        RAISE NOTICE '❌ Função authenticate_user NÃO existe';
        RAISE NOTICE '   Solução: Execute database/corrigir_login_URGENTE.sql';
        v_total_issues := v_total_issues + 1;
    ELSE
        RAISE NOTICE '✅ Função authenticate_user existe';
    END IF;
    
    IF v_users_without_password > 0 THEN
        RAISE NOTICE '❌ % usuários sem senha', v_users_without_password;
        RAISE NOTICE '   Solução: Execute reset_user_password para cada usuário';
        v_total_issues := v_total_issues + 1;
    ELSE
        RAISE NOTICE '✅ Todos os usuários têm senha';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    IF v_total_issues = 0 THEN
        RAISE NOTICE '🎉 TUDO OK! O sistema está pronto para login.';
        RAISE NOTICE '';
        RAISE NOTICE '👉 Próximo passo:';
        RAISE NOTICE '   1. Edite o username/senha na seção 4 acima';
        RAISE NOTICE '   2. Execute este script novamente';
        RAISE NOTICE '   3. Se o teste passar, tente o login no app';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO: % problema(s) encontrado(s)', v_total_issues;
        RAISE NOTICE '';
        RAISE NOTICE '👉 Próximo passo:';
        RAISE NOTICE '   Execute: database/corrigir_login_URGENTE.sql';
    END IF;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

