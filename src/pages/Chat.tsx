import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User, Clock, MessageSquare, Lock } from 'lucide-react';
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
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageCountRef = useRef<number>(0);

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

  // Função para verificar novas mensagens no Supabase
  const checkForNewMessages = async (chatId: string) => {
    try {
      const dbMessages = await ChatService.getChatMessages(chatId);
      
      // Se encontrou novas mensagens (mais mensagens do que antes)
      if (dbMessages.length > lastMessageCountRef.current) {
        const formattedMessages: Message[] = dbMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        
        setMessages(formattedMessages);
        
        // Verificar se a última mensagem é do assistente (resposta do n8n)
        const lastMessage = dbMessages[dbMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          // Resposta do assistente encontrada - parar polling
          stopPolling();
          setIsLoading(false);
        }
        
        lastMessageCountRef.current = dbMessages.length;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isReadOnly || !currentChat) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    // Salvar mensagem do usuário no Supabase
    await ChatService.addMessage(currentChat.id, 'user', input);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      lastMessageCountRef.current = newMessages.length;
      return newMessages;
    });
    
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

  if (loadingChat) {
    return (
      <div className="flex items-center justify-center h-[80vh] w-full max-w-4xl bg-white rounded-lg shadow-lg border">
        <div className="text-gray-500">Carregando conversa...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl bg-white rounded-lg shadow-lg border">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentChat?.title || 'Assistente de Estudos'}
              </h2>
              {isReadOnly && (
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  <Lock className="w-3 h-3" />
                  <span>Somente leitura</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {currentChat ? `Chat: ${currentChat.id.slice(0, 8)}...` : 'Nova conversa'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <MessageSquare className="w-4 h-4" />
          <span>{messages.length} mensagens</span>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-[80%] ${message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'assistant' 
                    ? 'bg-blue-600 mr-3' 
                    : 'bg-gray-600 ml-3'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Mensagem */}
                <div className="flex flex-col">
                  <div
                    className={`rounded-lg px-4 py-3 shadow-md ${
                      message.role === 'assistant'
                        ? 'bg-white text-gray-900 border border-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white text-gray-500 px-4 py-3 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Área de Input */}
      {!isReadOnly ? (
        <div className="border-t bg-white p-4 rounded-b-lg">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ex: Tenho uma prova de banco de dados dia 15"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 bg-blue-600 text-white hover:bg-blue-700 h-12 w-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Pressione Enter para enviar, Shift+Enter para nova linha
          </div>
        </div>
      ) : (
        <div className="border-t bg-gray-50 p-4 rounded-b-lg">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Esta conversa está arquivada e não pode ser editada.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 