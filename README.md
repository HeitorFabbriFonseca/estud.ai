# EstudAI - Assistente de Estudos Inteligente

Uma aplicação React moderna para assistência de estudos com interface completa e sistema de autenticação.

## 🚀 Funcionalidades

- **Sistema de Login**: Autenticação com usuário e senha
- **Chat Inteligente**: Interface de conversa com IA para estudos
- **Histórico de Conversas**: Visualize e gerencie todas as suas conversas
- **Visualização de Conversas Antigas**: Acesse conversas arquivadas em modo somente leitura
- **Armazenamento Persistente**: Todas as mensagens são salvas no Supabase
- **Perfil do Usuário**: Gerenciamento de informações pessoais
- **Configurações**: Personalização da experiência
- **Design Responsivo**: Interface moderna e intuitiva
- **Integração com Supabase**: Banco de dados para persistência de dados
- **Integração com n8n**: Webhook para processamento de mensagens

## 🛠️ Tecnologias

- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Supabase** para banco de dados e autenticação
- **Lucide React** para ícones
- **n8n** para processamento de webhooks

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd estud-ai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais:
```
# URL do Supabase (obrigatório)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# URL do Webhook do n8n (opcional)
VITE_N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/estud-ai
```

4. Configure o banco de dados Supabase:
   - Execute as queries SQL do arquivo `database/schema.sql` no SQL Editor do Supabase
   - Isso criará as tabelas necessárias: `user_info`, `chats` e `messages`

5. Execute o projeto:
```bash
npm run dev
```

## 🔐 Credenciais de Login

Para testar a aplicação, use as seguintes credenciais:

- **Usuário**: `usr`
- **Senha**: `1234`

## 🎯 Como Usar

1. **Login**: Acesse a aplicação e faça login com as credenciais acima
2. **Chat**: Use o assistente de estudos para fazer perguntas e receber ajuda
3. **Perfil**: Acesse seu perfil para ver informações da conta
4. **Configurações**: Personalize notificações, aparência e outras opções

## 🔧 Configuração do n8n

Para que o chat funcione corretamente, você precisa configurar um webhook no n8n:

1. Crie um novo workflow no n8n
2. Adicione um nó "Webhook" como trigger
3. Configure o webhook para receber dados JSON
4. Adicione um nó para processar a mensagem (ex: IA, API, etc.)
5. Configure a resposta para retornar no formato:
   ```json
   {
     "output": "Sua resposta aqui"
   }
   ```
6. Copie a URL do webhook e adicione no arquivo `.env.local`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Sidebar.tsx     # Barra lateral com navegação
│   ├── ProtectedRoute.tsx # Proteção de rotas
│   └── ui/             # Componentes de UI
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Página de login
│   ├── Chat.tsx        # Interface do chat
│   ├── ChatHistory.tsx # Histórico de conversas
│   ├── Profile.tsx     # Perfil do usuário
│   └── Settings.tsx    # Configurações
├── services/           # Serviços de integração
│   ├── chatService.ts  # Serviço de chats e mensagens
│   └── userService.ts  # Serviço de usuários
├── types/              # Definições de tipos TypeScript
│   ├── auth.ts         # Tipos de autenticação
│   ├── database.ts     # Tipos do banco de dados
│   └── supabase-database.ts # Tipos do Supabase
├── lib/                # Utilitários
│   ├── supabase.ts     # Cliente do Supabase
│   └── utils.ts        # Funções utilitárias
└── database/           # Scripts SQL
    └── schema.sql      # Schema do banco de dados
```

## 🎨 Personalização

A aplicação usa Tailwind CSS para estilização. Você pode personalizar:

- **Cores**: Edite as variáveis no `tailwind.config.cjs`
- **Tema**: Modifique os componentes para alterar a aparência
- **Funcionalidades**: Adicione novas páginas e funcionalidades

## 🚀 Deploy

Para fazer o build de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/` e podem ser servidos por qualquer servidor web estático.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se o webhook do n8n está configurado corretamente
2. Confirme se as variáveis de ambiente estão definidas
3. Verifique o console do navegador para erros
4. Abra uma issue no repositório

---

Desenvolvido com ❤️ pela equipe EstudAI
# estud.ai
