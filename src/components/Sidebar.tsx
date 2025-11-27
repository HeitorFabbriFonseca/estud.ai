import { NavLink } from 'react-router-dom';
import { MessageSquare, User, LogOut, History, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';

const navItems = [
  { to: '/', label: 'Conversas', icon: History },
  { to: '/chat', label: 'Nova conversa', icon: MessageSquare },
  { to: '/profile', label: 'Perfil', icon: User },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const preferredName = user?.name?.split(' ')[0] || 'Estudante';

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary text-white shadow-sm shadow-primary/30'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <aside className="flex w-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 text-slate-800 shadow-xl shadow-slate-900/5 lg:w-72 lg:shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">EstudAI</p>
          <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Bom estudo,</p>
        <p className="text-lg font-semibold text-slate-900">{preferredName}</p>
        <p className="mt-2 text-xs text-slate-500">
          Use o EstudAI para planejar sua próxima sessão.
        </p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navLinkClasses}>
            <Icon className="mr-3 h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="mt-auto rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} alt={user.name} size="md" showStatus statusColor="bg-emerald-400" />
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;