import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { User } from '../types/domain';
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  updateUserProfile,
  onAuthStateChange,
} from '../services/supabaseAuth';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  avatarUri?: string | null;
};

type UpdateProfilePayload = {
  name?: string;
  avatarUri?: string | null;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn('Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user: loggedUser } = await signIn(email, password);
      if (loggedUser) {
        setUser(loggedUser);
        setIsLoading(false);
      } else {
        throw new Error('Erro ao fazer login. Usuário não retornado.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const register = useCallback(async ({ name, email, password, avatarUri }: RegisterPayload) => {
    try {
      const { user: newUser } = await signUp(email, password, name);
      
      if (!newUser) {
        throw new Error('Erro ao criar usuário. Tente novamente.');
      }
      
      let finalUser = newUser;
      
      if (avatarUri) {
        try {
          await updateUserProfile(newUser.id, { avatar_uri: avatarUri });
          const updatedUser = await getCurrentUser();
          if (updatedUser) {
            finalUser = updatedUser;
          }
        } catch (avatarError) {
          console.warn('Erro ao atualizar avatar após cadastro:', avatarError);
        }
      }
      
      setUser(finalUser);
      setIsLoading(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Erro no registro:', error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async ({ name, avatarUri }: UpdateProfilePayload) => {
      if (!user) {
        throw new Error('Nenhum usuário autenticado.');
      }

      const updates: { name?: string; avatar_uri?: string | null } = {};

      if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          throw new Error('Informe um nome válido.');
        }
        updates.name = trimmedName;
      }

      if (typeof avatarUri !== 'undefined') {
        updates.avatar_uri = avatarUri ?? null;
      }

      const updatedUser = await updateUserProfile(user.id, updates);
      setUser(updatedUser);
    },
    [user],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);


  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const unsubscribe = onAuthStateChange((authUser) => {
      if (isMounted) {
        setUser((currentUser) => {
          if (currentUser && !authUser) {
            return currentUser;
          }
          return authUser;
        });
        setIsLoading(false);
      }
    });

    timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
      hydrate,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, hydrate, updateProfile],
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

