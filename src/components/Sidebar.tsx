import { NavLink } from 'react-router-dom';
import { MessageSquare, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
      isActive ? 'bg-gray-200 font-semibold' : ''
    }`;

  return (
    <div className="flex flex-col w-64 bg-white border-r min-h-screen">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-blue-600">EstudAI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navLinkClasses}>
          <MessageSquare className="w-5 h-5 mr-3" />
          Agente de Estudos
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
          <Settings className="w-5 h-5 mr-3" />
          Configurações
        </NavLink>
        <NavLink to="/profile" className={navLinkClasses}>
          <User className="w-5 h-5 mr-3" />
          Perfil
        </NavLink>
      </nav>

      {user && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 