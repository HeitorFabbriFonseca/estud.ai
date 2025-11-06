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
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-lg border">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Dados e Privacidade */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Dados e Privacidade</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Exportar Dados</h3>
                <p className="text-sm text-gray-600 mb-3">Baixe todos os seus dados em formato JSON</p>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exportando...' : 'Exportar Dados'}
                </button>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Limpar Dados Locais</h3>
                <p className="text-sm text-gray-600 mb-3">Remova todos os dados salvos localmente (não afeta o banco de dados)</p>
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Limpar Dados Locais
                </button>
              </div>
            </div>
          </div>

          {/* Sobre */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Sobre o EstudAI</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Versão</h3>
                <p className="text-sm text-gray-600">1.0.0</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Desenvolvido por</h3>
                <p className="text-sm text-gray-600">Equipe EstudAI</p>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Licença</h3>
                <p className="text-sm text-gray-600">MIT License</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação */}
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