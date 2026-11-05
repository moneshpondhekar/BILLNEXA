import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { isSupabaseConfigured } from '../integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (userType: 'admin' | 'monesh' | 'chetan') => Promise<void>;
  isLoading: boolean;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseConnected = isSupabaseConfigured();

  useEffect(() => {
    let isMounted = true;
    authService.getInitialUser().then(({ user: initialUser, token: initialToken }) => {
      if (isMounted) {
        if (initialUser && initialToken) {
          setUser(initialUser);
          setToken(initialToken);
        }
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: loggedInUser, token: authToken } = await authService.login(email, password);
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('billnexa_user', JSON.stringify(loggedInUser));
      localStorage.setItem('billnexa_token', authToken);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const switchDemoUser = async (userType: 'admin' | 'monesh' | 'chetan') => {
    let email = '';
    let password = '';
    if (userType === 'admin') {
      email = 'admin@gmail.com';
      password = 'Admin@123';
    } else if (userType === 'monesh') {
      email = 'Monesh@gmail.com';
      password = 'Monesh@123';
    } else if (userType === 'chetan') {
      email = 'Chetan@gmail.com';
      password = 'Chetan@123';
    }
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      switchDemoUser,
      isLoading,
      isSupabaseConnected
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
