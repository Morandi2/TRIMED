import React, { createContext, useContext } from 'react';
import { useDjangoAuth } from '../hooks/useDjangoAuth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuthStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useDjangoAuth();

  return (
    <AuthContext.Provider value={{ 
      user: auth.user, 
      isAuthenticated: auth.isAuthenticated, 
      isLoading: auth.isLoading, 
      login: auth.login, 
      logout: auth.logout,
      checkAuthStatus: auth.checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};