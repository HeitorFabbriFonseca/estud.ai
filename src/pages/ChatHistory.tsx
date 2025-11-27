import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ChatService } from '../services/chatService';
import type { Chat } from '../types/database';
import { MessageSquare, Clock, Archive, Trash2, Edit2, Search, X, Save } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import TutorialModal from '../components/TutorialModal';

const ChatHistory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user, showArchived]);

  useEffect(() => {
    // Verificar se deve mostrar o tutorial após login
    const locationState = location.state as { showTutorial?: boolean } | null;
    const tutorialSeen = localStorage.getItem('tutorialSeen');
    
    if (locationState?.showTutorial && !tutorialSeen) {
      // Pequeno delay para garantir que a página carregou
      setTimeout(() => {
        setShowTutorial(true);
      }, 500);
    }
  }, [location.state]);

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
      const userChats = await ChatService.getUserChats(user.id, true);
      setAllChats(userChats);
      const visibleChats = userChats.filter((chat) => (showArchived ? chat.is_archived : !chat.is_archived));
      setChats(visibleChats);
      setFilteredChats(visibleChats);
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

  const activeCount = allChats.filter((chat) => !chat.is_archived).length;
  const archivedCount = Math.max(allChats.length - activeCount, 0);
  const lastUpdatedChatDate = allChats[0]?.updated_at ? formatDate(allChats[0].updated_at) : 'Sem histórico';

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="frosted-card flex flex-col items-center gap-4">
          <MessageSquare className="h-8 w-8 text-cyan-200" />
          <p className="text-white/80">Carregando conversas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <section className="rounded-[32px] border border-white/5 bg-slate-950/50 p-8 text-white shadow-xl shadow-black/30 backdrop-blur-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              {showArchived ? 'Histórico arquivado' : 'Painel de conversas'}
            </p>
            <h2 className="text-3xl font-semibold">Mantenha seus estudos organizados</h2>
            <p className="mt-2 text-white/70">Busque, edite títulos e retome discussões rapidamente.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleNewChat}
              className="rounded-3xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-slate-100"
            >
              Nova conversa
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ativas</p>
            <p className="mt-2 text-3xl font-semibold">{activeCount}</p>
            <p className="text-sm text-white/60">conversas acompanhando sua evolução</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Arquivadas</p>
            <p className="mt-2 text-3xl font-semibold">{archivedCount}</p>
            <p className="text-sm text-white/60">conteúdos guardados para consulta</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Última atualização</p>
            <p className="mt-2 text-3xl font-semibold">{lastUpdatedChatDate}</p>
            <p className="text-sm text-white/60">registro mais recente</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/70">Filtro rápido</span>
          <div className="flex rounded-full border border-white/20 p-1">
            <button
              onClick={() => setShowArchived(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                !showArchived ? 'bg-white text-slate-900' : 'text-white/70'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                showArchived ? 'bg-white text-slate-900' : 'text-white/70'
              }`}
            >
              Arquivadas
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/5 bg-white/[0.04] p-5 shadow-xl shadow-black/30 backdrop-blur-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/40 py-3 pl-12 pr-12 text-sm text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                aria-label="Limpar busca"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            {filteredChats.length} resultado{filteredChats.length === 1 ? '' : 's'}
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/5 bg-slate-950/50 p-6 shadow-xl shadow-black/30 backdrop-blur-lg">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <MessageSquare className="h-12 w-12 text-white/30" />
            <div>
              <p className="text-lg font-semibold text-white">
                {searchQuery
                  ? 'Nenhuma conversa encontrada'
                  : showArchived
                  ? 'Nenhuma conversa arquivada'
                  : 'Ainda não há conversas'}
              </p>
              <p className="mt-1 text-sm text-white/60">
                {searchQuery
                  ? 'Tente outros termos ou revise seu histórico.'
                  : showArchived
                  ? 'Arquive uma conversa para ela aparecer aqui.'
                  : 'Inicie uma nova conversa e crie seu plano de estudos.'}
              </p>
            </div>
            {!showArchived && (
              <button
                onClick={handleNewChat}
                className="rounded-3xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-indigo-400"
              >
                Nova conversa
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 220px)' }}>
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200/40"
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                          className="flex-1 rounded-2xl border border-cyan-400/40 bg-slate-900/40 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleSaveTitle(chat.id, e)}
                            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-2 text-emerald-200 transition hover:bg-emerald-500/20"
                            aria-label="Salvar título"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white"
                            aria-label="Cancelar edição"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white truncate">{chat.title}</h3>
                        {chat.is_archived && <span className="chip border-white/20 text-white/70">Arquivada</span>}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/65">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(chat.updated_at)}
                      </span>
                      <span className="chip border-white/20 text-white/60">#{chat.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  {editingChatId !== chat.id && (
                    <div className="flex items-center gap-2 text-white/80 transition md:opacity-0 md:group-hover:opacity-100">
                      <button
                        onClick={(e) => handleEditTitle(chat, e)}
                        className="rounded-2xl border border-white/10 bg-slate-800/50 p-2 transition hover:border-blue-200/40 hover:text-white"
                        title="Editar título"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleArchiveChat(chat, e)}
                        className="rounded-2xl border border-white/10 bg-slate-800/50 p-2 transition hover:border-blue-200/40 hover:text-white"
                        title={chat.is_archived ? 'Desarquivar' : 'Arquivar'}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(chat, e)}
                        className="rounded-2xl border border-rose-300/40 bg-rose-500/15 p-2 text-rose-100 transition hover:bg-rose-500/25"
                        title="Deletar conversa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('tutorialSeen', 'true');
          navigate(location.pathname, { replace: true, state: {} });
        }}
      />
    </div>
  );
};

export default ChatHistory;

