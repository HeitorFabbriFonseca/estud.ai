# 🚀 SETUP LOGIN SIMPLES - GUIA RÁPIDO

## ⚡ PASSO A PASSO (3 MINUTOS)

### 1️⃣ EXECUTE O SCRIPT NO SUPABASE

1. Acesse: https://app.supabase.com
2. Vá em **SQL Editor** (menu lateral)
3. Copie e cole **TODO** o arquivo: `setup_completo_simples.sql`
4. Clique em **RUN** (ou Ctrl+Enter)

### 2️⃣ DEFINA SENHAS PARA SEUS USUÁRIOS

O script vai listar todos os usuários. Para cada um que estiver "❌ SEM SENHA", execute:

```sql
UPDATE user_info SET password = 'sua_senha' WHERE username = 'nome_do_usuario';
```

**Exemplos:**
```sql
UPDATE user_info SET password = 'pedro123' WHERE username = 'Pedro';
UPDATE user_info SET password = 'maria123' WHERE username = 'Maria';
```

### 3️⃣ TESTE NO SQL EDITOR

```sql
SELECT * FROM authenticate_user('Pedro', 'pedro123');
```

Se retornar os dados do usuário = ✅ FUNCIONOU!
Se retornar vazio = ❌ Username ou senha incorretos

### 4️⃣ TESTE NO APP

1. Abra o app
2. Pressione **F12** (DevTools)
3. Vá na aba **Console**
4. Faça login
5. Veja os logs detalhados

---

## 📝 CRIAR NOVO USUÁRIO

```sql
INSERT INTO user_info (username, name, email, password)
VALUES ('joao', 'João Silva', 'joao@email.com', 'joao123');
```

---

## 🔧 ALTERAR SENHA

```sql
UPDATE user_info SET password = 'nova_senha' WHERE username = 'nome_usuario';
```

---

## ✅ O QUE MUDOU

- **ANTES**: Senha com bcrypt (complicado, com erro de ambiguidade)
- **AGORA**: Senha em texto simples (funciona direto)
- **Coluna**: `password` (texto simples)
- **Função**: `authenticate_user(username, password)` - super simples

---

## 🎯 TESTE RÁPIDO

Execute no SQL Editor:

```sql
-- Ver todos os usuários e suas senhas
SELECT username, name, password FROM user_info;

-- Definir senha
UPDATE user_info SET password = 'teste123' WHERE username = 'seu_usuario';

-- Testar login
SELECT * FROM authenticate_user('seu_usuario', 'teste123');
```

---

## ⚠️ IMPORTANTE

Esta é uma **prova de conceito** com senhas em texto simples.
**NÃO use em produção!** 

Para produção, use hash de senha adequado.

---

## 🆘 PROBLEMAS?

1. Execute `setup_completo_simples.sql` novamente
2. Verifique se a senha está definida: `SELECT username, password FROM user_info;`
3. Veja os logs no console do navegador (F12)
4. Teste direto no SQL: `SELECT * FROM authenticate_user('user', 'senha');`

