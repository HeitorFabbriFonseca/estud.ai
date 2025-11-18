import React, { useState } from 'react';
import { X, MessageSquare, History, Settings, User, ArrowRight, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bem-vindo ao EstudAI! 🎓',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Estamos felizes em tê-lo aqui! Este é um guia rápido para você começar a usar a plataforma.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Você pode pular este tutorial a qualquer momento clicando em "Pular Tutorial".
            </p>
          </div>
        </div>
      ),
      icon: <Sparkles className="w-12 h-12 text-blue-600" />
    },
    {
      title: 'Nova Conversa 💬',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Clique em <strong>"Nova Conversa"</strong> na barra lateral ou no botão principal para começar a conversar com o assistente de IA.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MessageSquare className="w-5 h-5" />
            <span>Use para fazer perguntas, estudar tópicos e obter ajuda com seus estudos.</span>
          </div>
        </div>
      ),
      icon: <MessageSquare className="w-12 h-12 text-blue-600" />
    },
    {
      title: 'Histórico de Conversas 📚',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Acesse <strong>"Conversas"</strong> para ver todas as suas conversas anteriores. Você pode:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
            <li>Buscar conversas antigas</li>
            <li>Editar títulos das conversas</li>
            <li>Arquivar ou deletar conversas</li>
          </ul>
        </div>
      ),
      icon: <History className="w-12 h-12 text-blue-600" />
    },
    {
      title: 'Configurações e Perfil ⚙️',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Personalize sua experiência nas seções de <strong>"Configurações"</strong> e <strong>"Perfil"</strong>.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-gray-600 mb-2" />
              <p className="text-xs text-gray-600">Ajuste as preferências da aplicação</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <User className="w-6 h-6 text-gray-600 mb-2" />
              <p className="text-xs text-gray-600">Gerencie seu perfil e informações</p>
            </div>
          </div>
        </div>
      ),
      icon: <Settings className="w-12 h-12 text-blue-600" />
    },
    {
      title: 'Pronto para começar! 🚀',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Agora você está pronto para começar a usar o EstudAI! Explore todas as funcionalidades e aproveite seus estudos.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Lembre-se:</strong> Você pode sempre voltar a este tutorial através das configurações.
            </p>
          </div>
        </div>
      ),
      icon: <Sparkles className="w-12 h-12 text-green-600" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
            <p className="text-sm text-gray-600">
              Passo {currentStep + 1} de {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
            title="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {currentStepData.content}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Pular Tutorial
          </button>
          <div className="flex items-center space-x-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Começar' : 'Próximo'}</span>
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;

