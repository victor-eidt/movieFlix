import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User, WatchedMovie } from '../types/domain';

const USERS_KEY = '@rateMyMovie/users';
const CURRENT_USER_ID_KEY = '@rateMyMovie/currentUserId';
const watchedKey = (userId: string): string => `@rateMyMovie/watched/${userId}`;

const parseJson = <T,>(value: string | null): T | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse persisted value', error);
    return undefined;
  }
};

export const getPersistedUsers = async (): Promise<User[]> => {
  const serialized = await AsyncStorage.getItem(USERS_KEY);
  return parseJson<User[]>(serialized) ?? [];
};

export const persistUsers = async (users: User[]): Promise<void> => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(CURRENT_USER_ID_KEY);
};

export const setCurrentUserId = async (userId: string | null): Promise<void> => {
  if (!userId) {
    await AsyncStorage.removeItem(CURRENT_USER_ID_KEY);
    return;
  }

  await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userId);
};

export const getWatchedMovies = async (userId: string): Promise<WatchedMovie[]> => {
  const serialized = await AsyncStorage.getItem(watchedKey(userId));
  return parseJson<WatchedMovie[]>(serialized) ?? [];
};

export const persistWatchedMovies = async (
  userId: string,
  movies: WatchedMovie[],
): Promise<void> => {
  await AsyncStorage.setItem(watchedKey(userId), JSON.stringify(movies));
};

export const clearWatchedMovies = async (userId: string): Promise<void> => {
  await AsyncStorage.removeItem(watchedKey(userId));
};

export const clearAllUsers = async (): Promise<void> => {
  await AsyncStorage.multiRemove([USERS_KEY, CURRENT_USER_ID_KEY]);
};

