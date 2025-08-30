export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
} 