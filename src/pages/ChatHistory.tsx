import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ChatService } from '../services/chatService';
import type { Chat } from '../types/database';
import { MessageSquare, Clock, Archive, Trash2, Edit2, Search, X, Save } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

const ChatHistory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user, showArchived]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const loadChats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const userChats = await ChatService.getUserChats(user.id, showArchived);
      setChats(userChats);
      setFilteredChats(userChats);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      showToast('Erro ao carregar conversas', 'error');
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

  const handleEditTitle = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditedTitle(chat.title);
  };

  const handleSaveTitle = async (chatId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!editedTitle.trim()) {
      showToast('O título não pode estar vazio', 'error');
      return;
    }

    try {
      const success = await ChatService.updateChatTitle(chatId, editedTitle.trim());
      if (success) {
        showToast('Título atualizado com sucesso!', 'success');
        setEditingChatId(null);
        loadChats();
      } else {
        showToast('Erro ao atualizar título', 'error');
      }
    } catch (error) {
      console.error('Erro ao salvar título:', error);
      showToast('Erro ao salvar título', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditedTitle('');
  };

  const handleDeleteClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChatId(chat.id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingChatId) return;

    try {
      const success = await ChatService.deleteChat(deletingChatId);
      if (success) {
        showToast('Conversa deletada com sucesso!', 'success');
        setDeletingChatId(null);
        loadChats();
      } else {
        showToast('Erro ao deletar conversa', 'error');
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error);
      showToast('Erro ao deletar conversa', 'error');
    }
  };

  const handleArchiveChat = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await ChatService.archiveChat(chat.id, !chat.is_archived);
      if (success) {
        showToast(chat.is_archived ? 'Conversa desarquivada!' : 'Conversa arquivada!', 'success');
        loadChats();
      } else {
        showToast('Erro ao arquivar conversa', 'error');
      }
    } catch (error) {
      console.error('Erro ao arquivar chat:', error);
      showToast('Erro ao arquivar conversa', 'error');
    }
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
      <div className="border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between p-4">
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
        
        {/* Busca */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {searchQuery 
                ? 'Nenhuma conversa encontrada'
                : showArchived 
                ? 'Nenhuma conversa arquivada' 
                : 'Nenhuma conversa ainda'}
            </p>
            <p className="text-sm text-center">
              {searchQuery
                ? 'Tente buscar com outros termos.'
                : showArchived 
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
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {editingChatId === chat.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveTitle(chat.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveTitle(chat.id, e)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {chat.title}
                          </h3>
                          {chat.is_archived && (
                            <Archive className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(chat.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {editingChatId !== chat.id && (
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditTitle(chat, e)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar título"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleArchiveChat(chat, e)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title={chat.is_archived ? 'Desarquivar' : 'Arquivar'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(chat, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Deletar conversa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        isOpen={deletingChatId !== null}
        title="Deletar Conversa"
        message="Tem certeza que deseja deletar esta conversa? Esta ação não pode ser desfeita e todas as mensagens serão perdidas."
        confirmText="Deletar"
        cancelText="Cancelar"
        confirmButtonColor="red"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingChatId(null)}
      />
    </div>
  );
};

export default ChatHistory;

