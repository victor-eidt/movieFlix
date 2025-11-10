import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Crypto from 'expo-crypto';

import type { User } from '../types/domain';
import {
  getCurrentUserId,
  getPersistedUsers,
  persistUsers,
  setCurrentUserId,
} from '../services/storage';

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

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const generateUserId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const hashPassword = async (password: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      setIsLoading(true);
      const [users, currentUserId] = await Promise.all([
        getPersistedUsers(),
        getCurrentUserId(),
      ]);

      if (!currentUserId) {
        setUser(null);
        return;
      }

      const currentUser = users.find((item) => item.id === currentUserId);
      setUser(currentUser ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      throw new Error('Informe e-mail e senha para continuar.');
    }

    const users = await getPersistedUsers();
    const existingUser = users.find((item) => item.email === normalizedEmail);

    if (!existingUser) {
      throw new Error('Usuário não encontrado. Verifique o e-mail digitado.');
    }

    const passwordHash = await hashPassword(password);

    if (existingUser.passwordHash !== passwordHash) {
      throw new Error('Senha incorreta. Tente novamente.');
    }

    await setCurrentUserId(existingUser.id);
    setUser(existingUser);
  }, []);

  const register = useCallback(
    async ({ name, email, password, avatarUri }: RegisterPayload) => {
      const normalizedEmail = normalizeEmail(email);
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Informe um nome para concluir o cadastro.');
      }

      if (!normalizedEmail) {
        throw new Error('Informe um e-mail válido.');
      }

      if (password.length < 6) {
        throw new Error('A senha deve conter pelo menos 6 caracteres.');
      }

      const users = await getPersistedUsers();
      const alreadyExists = users.some((item) => item.email === normalizedEmail);

      if (alreadyExists) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.');
      }

      const passwordHash = await hashPassword(password);
      const newUser: User = {
        id: generateUserId(),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        avatarUri: avatarUri ?? null,
      };

      const updatedUsers = [...users, newUser];
      await persistUsers(updatedUsers);
      await setCurrentUserId(newUser.id);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await setCurrentUserId(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async ({ name, avatarUri }: UpdateProfilePayload) => {
      if (!user) {
        throw new Error('Nenhum usuário autenticado.');
      }

      const updates: Partial<User> = {};

      if (typeof name === 'string') {
        const trimmedName = name.trim();
        if (!trimmedName) {
          throw new Error('Informe um nome válido.');
        }
        updates.name = trimmedName;
      }

      if (typeof avatarUri !== 'undefined') {
        updates.avatarUri = avatarUri ?? null;
      }

      if (Object.keys(updates).length === 0) {
        return;
      }

      const users = await getPersistedUsers();
      const updatedUsers = users.map((item) =>
        item.id === user.id ? { ...item, ...updates } : item,
      );

      const updatedUser = updatedUsers.find((item) => item.id === user.id);
      if (!updatedUser) {
        throw new Error('Usuário não encontrado para atualização.');
      }

      await persistUsers(updatedUsers);
      setUser(updatedUser);
    },
    [user],
  );

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

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

