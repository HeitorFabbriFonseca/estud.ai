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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isReadOnly || !currentChat) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    // Salvar mensagem do usuário no Supabase e obter seu sequence_order
    const savedUserMessage = await ChatService.addMessage(currentChat.id, 'user', input);
    if (!savedUserMessage) {
      console.error('Erro ao salvar mensagem do usuário');
      return;
    }
    
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    const userMessageSequence = savedUserMessage.sequence_order;
    setInput('');
    setIsLoading(true);

    try {
      if (!WEBHOOK_URL) {
        throw new Error('Webhook URL não configurada');
      }

      const webhookUrl: string = WEBHOOK_URL;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); 
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput, 
          chatId: currentChat.id,
          lastSequenceOrder: userMessageSequence // Enviar para n8n calcular o próximo
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Erro ao conectar ao webhook');
      }
      
      // Webhook respondeu com sucesso
      // O n8n pode ter respondido diretamente ou apenas confirmado o recebimento
      const responseData = await response.json();
      console.log('Resposta do webhook:', responseData);
      
      // Verificar se a resposta já contém a mensagem do assistente
      // (caso o n8n tenha processado e respondido diretamente)
      if (responseData.content && responseData.role === 'assistant') {
        // Resposta direta do n8n - salvar e exibir
        await ChatService.addMessage(currentChat.id, 'assistant', responseData.content);
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: responseData.content,
            timestamp: new Date()
          }
        ]);
        setIsLoading(false);
        return; // Sucesso!
      }
      
      // Se não houver resposta direta, fazer polling no Supabase
      // para verificar se há nova mensagem do assistente
      let attempts = 0;
      const maxAttempts = 120; // 10 minutos (120 * 5s)
      const pollInterval = 5000; // 5 segundos
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        
        try {
          const newMessage = await ChatService.checkForNewAssistantMessage(
            currentChat.id, 
            userMessageSequence
          );
          
          if (newMessage) {
            // Mensagem encontrada! Exibir no chat
            setMessages(prev => [
              ...prev,
              { 
                role: 'assistant', 
                content: newMessage.content,
                timestamp: new Date(newMessage.created_at)
              }
            ]);
            setIsLoading(false);
            return; // Sucesso!
          }
        } catch (pollError) {
          console.error('Erro ao verificar nova mensagem:', pollError);
          // Continuar tentando
        }
      }
      
      // Timeout do polling
      throw new Error('Timeout: A resposta demorou mais que o esperado. Verifique se o processamento foi concluído.');
      
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do n8n está configurado corretamente.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'O servidor não respondeu a tempo. O processamento pode estar em andamento. Verifique o chat em alguns instantes.';
      } else if (error.message.includes('Timeout')) {
        errorMessage = 'O processamento está demorando mais que o esperado. Verifique o chat em alguns instantes - a resposta pode aparecer em breve.';
      }
      
      // Verificar uma última vez se a mensagem foi salva
      try {
        const lastCheck = await ChatService.checkForNewAssistantMessage(
          currentChat.id, 
          userMessageSequence
        );
        
        if (lastCheck) {
          // Mensagem foi encontrada na última verificação!
          setMessages(prev => [
            ...prev,
            { 
              role: 'assistant', 
              content: lastCheck.content,
              timestamp: new Date(lastCheck.created_at)
            }
          ]);
          setIsLoading(false);
          return;
        }
      } catch (checkError) {
        console.error('Erro na verificação final:', checkError);
      }
      
      // Se chegou aqui, realmente não há mensagem
      // Salvar mensagem de erro
      await ChatService.addMessage(currentChat.id, 'assistant', errorMessage);
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: errorMessage,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
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