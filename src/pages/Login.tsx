import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/', { state: { showTutorial: true } });
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-cyan-500/30 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-[160px]" />
      </div>
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500 shadow-lg shadow-cyan-500/30">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold">Bem-vindo ao EstudAI</h2>
            <p className="mb-8 text-white/70">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-white/70">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:outline-none"
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/70">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 pr-12 text-white placeholder:text-white/40 focus:border-cyan-400/60 focus:outline-none"
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 transition hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 