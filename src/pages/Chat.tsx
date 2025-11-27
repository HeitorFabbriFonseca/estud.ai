import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User, Clock, MessageSquare, Lock, Sparkles } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { ChatService } from '../services/chatService';
import type { Chat } from '../types/database';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);
  const quickPrompts = [
    'Monte um plano de estudos para revisar SQL em 5 dias.',
    'Crie flashcards com os principais conceitos de redes de computadores.',
    'Me ajude a transformar o edital da prova em tópicos priorizados.',
  ];

  const loadChat = async (id: string) => {
    if (!user?.id) return;

    setLoadingChat(true);
    try {
      const chat = await ChatService.getChat(id);
      if (!chat) {
        navigate('/chat');
        return;
      }

      // Verificar se o chat pertence ao usuário
      if (chat.user_id !== user.id) {
        navigate('/chat');
        return;
      }

      setCurrentChat(chat);
      setIsReadOnly(chat.is_archived);

      // Carregar mensagens
      const dbMessages = await ChatService.getChatMessages(id);
      const formattedMessages: Message[] = dbMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      if (formattedMessages.length === 0) {
        // Mensagem de boas-vindas se não houver mensagens
        formattedMessages.push({
          role: 'assistant',
          content: `Olá ${user?.name || 'usuário'}! 👋\n\nSou seu assistente de estudos personalizado.\n\n• 📚 Me conte sobre sua prova e vamos elaborar um plano de estudos!`,
          timestamp: new Date(),
        });
      }

      setMessages(formattedMessages);
      lastMessageCountRef.current = formattedMessages.length;
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
      navigate('/chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const createNewChat = async () => {
    if (!user?.id) return;

    try {
      const chat = await ChatService.createChat(user.id);
      if (chat) {
        setCurrentChat(chat);
        setIsReadOnly(false);
        navigate(`/chat/${chat.id}`, { replace: true });
        
        // Mensagem de boas-vindas
        setMessages([
          {
            role: 'assistant',
            content: `Olá ${user?.name || 'usuário'}! 👋\n\nSou seu assistente de estudos personalizado.\n\n• 📚 Me conte sobre sua prova e vamos elaborar um plano de estudos!`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Erro ao criar chat:', error);
    }
  };

  // Carregar chat existente ou criar novo
  useEffect(() => {
    if (!user?.id) return;

    if (chatId) {
      // Carregar chat existente
      loadChat(chatId);
    } else {
      // Criar novo chat
      createNewChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Limpar polling quando o componente desmontar ou o chat mudar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [chatId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return 'Agora';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60000) return 'Agora';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
  };

  // Função para verificar novas mensagens no Supabase
  const checkForNewMessages = async (chatId: string) => {
    try {
      const dbMessages = await ChatService.getChatMessages(chatId);
      
      console.log('Polling - Mensagens no banco:', dbMessages.length, 'Última contagem:', lastMessageCountRef.current);
      
      // Se encontrou novas mensagens (mais mensagens do que antes)
      if (dbMessages.length > lastMessageCountRef.current) {
        console.log('Nova mensagem detectada! Atualizando UI...');
        
        const formattedMessages: Message[] = dbMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
        lastMessageCountRef.current = dbMessages.length;
        
        // Verificar se a última mensagem é do assistente (resposta do n8n)
        const lastMessage = dbMessages[dbMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          console.log('Resposta do assistente encontrada! Parando polling...');
          // Resposta do assistente encontrada - parar polling
          stopPolling();
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar novas mensagens:', error);
    }
  };

  // Função para iniciar o polling
  const startPolling = (chatId: string) => {
    // Limpar polling anterior se existir
    stopPolling();
    
    // Verificar a cada 2 segundos
    pollingIntervalRef.current = window.setInterval(() => {
      checkForNewMessages(chatId);
    }, 2000);
  };

  // Função para parar o polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handlePromptInsert = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isReadOnly || !currentChat) return;

    // Salvar mensagem do usuário no Supabase
    await ChatService.addMessage(currentChat.id, 'user', input);
    
    // Recarregar mensagens do banco para ter a contagem correta
    const dbMessages = await ChatService.getChatMessages(currentChat.id);
    const formattedMessages: Message[] = dbMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
    }));
    
    setMessages(formattedMessages);
    lastMessageCountRef.current = dbMessages.length;
    
    // Calcular próximo sequence_order para a resposta do assistente
    const nextSequence = await ChatService.getNextSequenceOrder(currentChat.id);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      if (!WEBHOOK_URL) {
        throw new Error('Webhook URL não configurada');
      }

      // Enviar webhook do n8n (retorna imediatamente, não aguarda resposta)
      const webhookUrl: string = WEBHOOK_URL;
      
      // Fire and forget - não aguardamos a resposta
      // Inclui next_sequence para o n8n saber qual sequence_order usar
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput, 
          chatId: currentChat.id,
          next_sequence: nextSequence 
        }),
      }).catch((error) => {
        console.error('Erro ao enviar webhook:', error);
        // Mesmo se houver erro no webhook, vamos continuar verificando o banco
      });
      
      // Iniciar polling para verificar quando a resposta do n8n for salva no Supabase
      startPolling(currentChat.id);
      
      // Timeout de segurança: parar polling após 5 minutos
      setTimeout(() => {
        if (pollingIntervalRef.current) {
          stopPolling();
          setIsLoading(false);
          console.log('Polling interrompido após 5 minutos');
        }
      }, 300000); // 5 minutos
      
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      setIsLoading(false);
      
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do n8n está configurado corretamente.';
      
      // Salvar mensagem de erro também
      await ChatService.addMessage(currentChat.id, 'assistant', errorMessage);
      
      setMessages(prev => {
        const newMessages = [
          ...prev,
          { 
            role: 'assistant' as const, 
            content: errorMessage,
            timestamp: new Date()
          }
        ];
        lastMessageCountRef.current = newMessages.length;
        return newMessages;
      });
    }
  };

  const lastUpdateLabel = formatRelativeDate(currentChat?.updated_at);
  const hasUserMessages = messages.some((message) => message.role === 'user');
  const conversationStatus = isReadOnly ? 'Arquivada' : 'Em andamento';

  if (loadingChat) {
    return (
      <div className="w-full">
        <div className="frosted-card flex h-[70vh] flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-6 w-6 animate-spin text-cyan-200" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white">Carregando conversa...</p>
            <p className="text-sm text-white/70">Estamos preparando seu histórico</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-[32px] border border-white/5 bg-slate-950/60 text-white shadow-xl shadow-black/30 backdrop-blur-xl">
        <div className="flex h-[78vh] flex-col">
          <div className="rounded-t-[32px] border-b border-white/5 bg-white/[0.04] px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Assistente de estudos</p>
                <h2 className="text-2xl font-semibold text-white">
                  {currentChat?.title || 'Nova conversa inteligente'}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Crie planos personalizados, revise conteúdos e acompanhe sua evolução.</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{conversationStatus}</span>
                <span className="chip">{lastUpdateLabel}</span>
                <span className="chip flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {messages.length} mensagens
                </span>
                {isReadOnly && (
                  <span className="chip border-rose-400/60 text-rose-100">
                    <Lock className="mr-2 h-3.5 w-3.5" />
                    Arquivo seguro
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {!hasUserMessages && (
              <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-4">
                <p className="text-sm font-medium text-white">Sugestões rápidas</p>
                <p className="text-sm text-white/70">Use um atalho para começar mais rápido.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptInsert(prompt)}
                      className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-2 text-left text-sm text-white/80 transition hover:border-cyan-400/40 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => {
                const isAssistant = message.role === 'assistant';
                return (
                  <div
                    key={index}
                    className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`flex max-w-[80%] gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                          isAssistant
                            ? 'border border-white/10 bg-cyan-500/20 text-cyan-100'
                            : 'bg-white text-slate-900'
                        }`}
                      >
                        {isAssistant ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div
                          className={`rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg shadow-black/20 ${
                            isAssistant
                              ? 'border border-white/5 bg-white/[0.05] text-white'
                              : 'border border-white/10 bg-white text-slate-900'
                          }`}
                        >
                          {isAssistant ? (
                            <MarkdownRenderer content={message.content} className="space-y-3 text-slate-100" />
                          ) : (
                            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 text-[11px] uppercase tracking-[0.35em] text-white/40 ${
                            isAssistant ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                <div className="flex max-w-[80%] items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-800/60 text-white/80">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <span className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-white/60"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </span>
                        <span>Gerando resposta...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {!isReadOnly ? (
            <div className="rounded-b-[32px] border-t border-white/5 bg-slate-950/40 px-6 py-5">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="flex-1 rounded-3xl border border-white/5 bg-white/[0.04] px-5 py-3 transition focus-within:border-blue-200/60">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ex: Tenho uma prova de banco de dados dia 15"
                      className="max-h-32 min-h-[54px] w-full resize-none bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                      rows={1}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex h-14 w-full items-center justify-center rounded-3xl bg-slate-200/90 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 md:w-20"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
              <p className="mt-3 text-center text-xs text-white/60">
                Enter envia · Shift + Enter adiciona nova linha
              </p>
            </div>
          ) : (
            <div className="rounded-b-[32px] border-t border-white/5 bg-white/[0.04] px-6 py-5">
              <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                <Lock className="h-4 w-4" />
                <span>Esta conversa está arquivada e permanece disponível apenas para leitura.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 