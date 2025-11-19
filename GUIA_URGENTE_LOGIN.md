# 🚨 GUIA URGENTE - CORRIGIR PROBLEMA DE LOGIN

## ❗ O PROBLEMA
O login retorna vazio mesmo com usuário e senha corretos.

## ✅ SOLUÇÃO RÁPIDA (3 PASSOS)

### PASSO 1: Executar Script de Correção no Supabase

1. Acesse o **Supabase Dashboard** (https://app.supabase.com)
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Copie e cole TODO o conteúdo do arquivo: `database/corrigir_login_URGENTE.sql`
5. Clique em **RUN** (ou pressione Ctrl+Enter)
6. ⚠️ **IMPORTANTE**: Veja os resultados no console abaixo!

### PASSO 2: Verificar se Usuários Têm Senha

Após executar o script, você verá uma tabela no final com os usuários:

```
username    | name     | status
------------|----------|------------
pedro       | Pedro    | ✅ OK
maria       | Maria    | ❌ SEM SENHA
```

Se algum usuário aparecer como "❌ SEM SENHA", execute este comando no SQL Editor:

```sql
SELECT reset_user_password('seu_username', 'sua_nova_senha');
```

**Exemplo:**
```sql
SELECT reset_user_password('pedro', 'pedro123');
```

### PASSO 3: Testar Login na Aplicação

1. Abra a aplicação no navegador
2. Pressione **F12** para abrir o DevTools (Console)
3. Tente fazer login
4. Veja os logs detalhados no console - eles vão mostrar exatamente onde está o problema!

---

## 🔍 DIAGNÓSTICO DETALHADO

Se ainda não funcionar, execute o script de diagnóstico:

1. Abra o **SQL Editor** no Supabase
2. Execute o arquivo: `database/diagnostico_login.sql`
3. Leia atentamente os resultados
4. Envie os resultados para análise

---

## 🆘 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Função authenticate_user não existe"
**Solução:** Execute `database/corrigir_login_URGENTE.sql`

### Problema 2: "Usuário sem senha"
**Solução:** Execute:
```sql
SELECT reset_user_password('seu_username', 'sua_senha');
```

### Problema 3: "Extension pgcrypto não encontrada"
**Solução:** Execute no SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Problema 4: "Data retorna array vazio"
**Possíveis causas:**
- Senha incorreta (mesmo que você ache que está certa)
- Username com espaços ou diferente do cadastrado
- Hash de senha corrompido no banco

**Solução:**
```sql
-- Verificar username exato no banco
SELECT username, name FROM user_info;

-- Redefinir senha para ter certeza
SELECT reset_user_password('username_exato', 'nova_senha_123');
```

---

## 📋 CHECKLIST DE VERIFICAÇÃO

- [ ] Executei `database/corrigir_login_URGENTE.sql` no Supabase
- [ ] Verifiquei que a extensão pgcrypto está habilitada
- [ ] Verifiquei que a função authenticate_user existe
- [ ] Todos os usuários têm status "✅ OK" (com senha)
- [ ] Abri o DevTools (F12) no navegador
- [ ] Vi os logs detalhados ao tentar fazer login
- [ ] Username e senha estão EXATAMENTE como no banco (sem espaços extras)

---

## 💡 DICA IMPORTANTE

Após fazer login com sucesso pela primeira vez, você pode **remover os logs detalhados** do código se desejar (eles estão em `src/services/userService.ts`).

---

## 🎯 TESTE RÁPIDO

Execute este comando no SQL Editor do Supabase para testar diretamente:

```sql
-- Substitua 'seu_username' e 'sua_senha' pelos valores reais
SELECT * FROM authenticate_user('seu_username', 'sua_senha');
```

Se retornar **vazio**, a senha está incorreta ou o usuário não existe.
Se retornar **dados do usuário**, o problema está no frontend.

---

## 📞 AINDA COM PROBLEMAS?

1. Abra o DevTools (F12) no navegador
2. Vá na aba **Console**
3. Tente fazer login
4. Copie TODOS os logs que aparecem
5. Envie para análise - eles vão mostrar exatamente o que está errado!

