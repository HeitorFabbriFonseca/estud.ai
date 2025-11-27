import { NavLink } from 'react-router-dom';
import { MessageSquare, Settings, User, LogOut, History, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';

const navItems = [
  { to: '/', label: 'Conversas', icon: History },
  { to: '/chat', label: 'Nova conversa', icon: MessageSquare },
  { to: '/settings', label: 'Configurações', icon: Settings },
  { to: '/profile', label: 'Perfil', icon: User },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const preferredName = user?.name?.split(' ')[0] || 'Estudante';
  const weeklyProgress = 68;

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/90 text-slate-900 shadow-md shadow-slate-900/10'
        : 'text-slate-200 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <aside className="flex w-full flex-col rounded-[28px] border border-white/5 bg-slate-900/70 p-6 text-white shadow-xl shadow-black/30 backdrop-blur-lg lg:w-72 lg:shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/60">EstudAI</p>
          <h1 className="text-2xl font-bold text-white">Painel</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Sparkles className="h-5 w-5 text-cyan-200" />
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/5 bg-white/[0.04] p-4">
        <p className="text-sm text-white/70">Bom estudo,</p>
        <p className="text-lg font-semibold text-white">{preferredName}</p>
        <p className="mt-2 text-xs text-white/60">
          Continue consistente para alcançar sua meta semanal.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/60">
            <span>Foco semanal</span>
            <span>{weeklyProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-200 via-blue-200 to-slate-100"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
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
        <div className="mt-auto rounded-3xl border border-white/5 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} alt={user.name} size="md" showStatus statusColor="bg-emerald-400" />
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-white/60">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
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