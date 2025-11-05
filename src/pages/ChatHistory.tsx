import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../services/chatService';
import type { Chat } from '../types/database';
import { MessageSquare, Clock, Archive } from 'lucide-react';

const ChatHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user, showArchived]);

  const loadChats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userChats = await ChatService.getUserChats(user.id, showArchived);
      setChats(userChats);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Ontem';
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Carregando conversas...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {showArchived ? 'Conversas Arquivadas' : 'Conversas'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4 mr-2" />
            {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
          </button>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Nova Conversa
          </button>
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 80px)' }}>
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {showArchived ? 'Nenhuma conversa arquivada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="text-sm text-center">
              {showArchived 
                ? 'Você ainda não arquivou nenhuma conversa.'
                : 'Comece uma nova conversa para começar a estudar!'
              }
            </p>
            {!showArchived && (
              <button
                onClick={handleNewChat}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nova Conversa
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      {chat.is_archived && (
                        <Archive className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(chat.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;

