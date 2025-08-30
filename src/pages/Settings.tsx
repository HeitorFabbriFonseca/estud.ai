import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Sun, Globe, Shield, Database } from 'lucide-react';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('pt-BR');
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg shadow-lg border">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Notificações */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Bell className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Notificações</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">Notificações por Email</h3>
                  <p className="text-sm text-gray-600">Receber notificações sobre novas funcionalidades e atualizações</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">Notificações Push</h3>
                  <p className="text-sm text-gray-600">Receber notificações em tempo real no navegador</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              {darkMode ? <Moon className="w-6 h-6 text-blue-600 mr-3" /> : <Sun className="w-6 h-6 text-blue-600 mr-3" />}
              <h2 className="text-xl font-semibold text-gray-900">Aparência</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">Modo Escuro</h3>
                  <p className="text-sm text-gray-600">Ativar tema escuro para reduzir o cansaço visual</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idioma
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados e Privacidade */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Dados e Privacidade</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h3 className="font-medium text-gray-900">Salvamento Automático</h3>
                  <p className="text-sm text-gray-600">Salvar automaticamente suas conversas e configurações</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Exportar Dados</h3>
                <p className="text-sm text-gray-600 mb-3">Baixe todos os seus dados em formato JSON</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Exportar Dados
                </button>
              </div>
              
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Limpar Dados</h3>
                <p className="text-sm text-gray-600 mb-3">Remova todos os dados salvos localmente</p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Limpar Dados
                </button>
              </div>
            </div>
          </div>

          {/* Sobre */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-blue-600 mr-3" />
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
    </div>
  );
};

export default Settings; 