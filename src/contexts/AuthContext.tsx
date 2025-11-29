import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import { UserService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

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
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

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
            } else {
              // Usuário não existe mais
              setUser(null);
              localStorage.removeItem('user');
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    }

    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const dbUser = await UserService.authenticateUser(username, password);

      if (dbUser) {
        const loggedUser: User = {
          id: dbUser.id,
          username: dbUser.username,
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.avatar || undefined,
        };

        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
