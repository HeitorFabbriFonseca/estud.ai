import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth';
import { UserService } from '../services/userService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Verifica se há um usuário salvo no localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Verificar se o usuário ainda existe no Supabase
        if (parsedUser.id) {
          UserService.getUserById(parsedUser.id).then((dbUser) => {
            if (dbUser) {
              const updatedUser: User = {
                id: dbUser.id,
                username: dbUser.username,
                name: dbUser.name,
                email: dbUser.email,
                avatar: dbUser.avatar || undefined,
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Login falso - verifica se é usr/1234
    if (username === 'usr' && password === '1234') {
      try {
        // Criar ou obter usuário no Supabase
        const dbUser = await UserService.createOrGetUser({
          username: 'usr',
          name: 'Usuário Teste',
          email: 'usuario@teste.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=usr'
        });

        if (dbUser) {
          const user: User = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name,
            email: dbUser.email,
            avatar: dbUser.avatar || undefined,
          };
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          return true;
        }
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        // Fallback para o comportamento antigo se o Supabase não estiver configurado
        const fakeUser: User = {
          id: '1',
          username: 'usr',
          name: 'Usuário Teste',
          email: 'usuario@teste.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=usr'
        };
        
        setUser(fakeUser);
        localStorage.setItem('user', JSON.stringify(fakeUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 