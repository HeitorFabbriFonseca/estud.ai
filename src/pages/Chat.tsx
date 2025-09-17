import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Bot, User, Clock, MessageSquare } from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gera um ID de sessão único quando o chat é iniciado
    setSessionId(crypto.randomUUID());

    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Olá ${user?.name || 'usuário'}! 👋\n\nSou seu assistente de estudos personalizado.\n\n• 📚 Me conte sobre sua prova e vamos elaborar um plano de estudos!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]);

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
    if (!input.trim() || isLoading) return;

    const newMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, sessionId: sessionId })
      });
      if (!response.ok) throw new Error('Erro ao conectar ao webhook');
      const data = await response.json();
      
      // Processa a resposta no formato da webhook
      let reply = 'Sem resposta do servidor.';
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // Lida com a resposta em formato de array: [{ "output": "..." }]
        reply = data[0].output;
      } else if (data && data.output) {
        // Lida com a resposta em formato de objeto: { "output": "..." }
        reply = data.output;
      } else if (data.reply) {
        // Fallback para o formato anterior
        reply = data.reply;
      }
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error("Erro detalhado:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do n8n está configurado corretamente.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl bg-white rounded-lg shadow-lg border">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assistente de Estudos</h2>
            <p className="text-sm text-gray-600">Sessão: {sessionId.slice(0, 8)}...</p>
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
      <div className="border-t bg-white p-4 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
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
    </div>
  );
};

export default Chat; 