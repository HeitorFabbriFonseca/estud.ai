import { useState } from 'react';
import { Shield, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../services/chatService';
import ConfirmDialog from '../components/ConfirmDialog';

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleExportData = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      // Buscar todos os chats e mensagens do usuário
      const chats = await ChatService.getUserChats(user.id, true);
      const exportData: any = {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
        },
        chats: [],
        exportedAt: new Date().toISOString(),
      };

      for (const chat of chats) {
        const messages = await ChatService.getChatMessages(chat.id);
        exportData.chats.push({
          ...chat,
          messages,
        });
      }

      // Criar arquivo JSON e fazer download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estud-ai-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      showToast('Erro ao exportar dados', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearLocalData = () => {
    // Limpar localStorage
    localStorage.clear();
    showToast('Dados locais limpos com sucesso!', 'success');
    setShowClearDialog(false);
    // Recarregar a página para aplicar as mudanças
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="w-full space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Configurações</p>
          <h1 className="text-3xl font-semibold text-slate-900">Personalize sua experiência</h1>
          <p className="text-slate-500">
            Controle seus dados, exporte conversas e saiba mais sobre o EstudAI.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Dados e Privacidade</h2>
              <p className="text-sm text-slate-500">Você tem controle total sobre seus dados.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Exportar Dados</h3>
              <p className="mt-1 text-sm text-slate-500">Baixe todos os seus dados em formato JSON.</p>
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? 'Exportando...' : 'Exportar dados'}
              </button>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
              <h3 className="text-sm font-semibold text-rose-900">Limpar Dados Locais</h3>
              <p className="mt-1 text-sm text-rose-600">
                Remove apenas informações salvas no navegador, sem afetar o banco de dados.
              </p>
              <button
                onClick={() => setShowClearDialog(true)}
                className="mt-4 flex w-full items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-rose-600 transition hover:bg-rose-100"
              >
                Limpar dados locais
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-indigo-500">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Sobre o EstudAI</h2>
              <p className="text-sm text-slate-500">Conheça a plataforma que impulsiona seus estudos.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Versão</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">1.0.0</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Desenvolvido por</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">Equipe EstudAI</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Licença</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">MIT License</p>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        title="Limpar Dados Locais"
        message="Tem certeza que deseja limpar todos os dados salvos localmente? Isso irá remover apenas os dados do navegador, não afetará o banco de dados."
        confirmText="Limpar"
        cancelText="Cancelar"
        confirmButtonColor="red"
        onConfirm={handleClearLocalData}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  );
};

export default Settings; 