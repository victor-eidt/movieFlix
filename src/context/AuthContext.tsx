import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { User } from '../types/domain';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hydrate = useCallback(async () => {
    setIsLoading(true);
    await Promise.resolve();
    setIsLoading(false);
  }, []);

  const login = useCallback(async () => {
    throw new Error('login() not implemented yet.');
  }, []);

  const register = useCallback(async () => {
    throw new Error('register() not implemented yet.');
  }, []);

  const logout = useCallback(async () => {
    throw new Error('logout() not implemented yet.');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      hydrate,
      setUser,
    }),
    [user, isLoading, login, register, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

