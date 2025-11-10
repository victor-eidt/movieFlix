import React, { createContext, useContext, useMemo, useReducer, useCallback } from 'react';

import type { WatchedMovie } from '../types/domain';

type WatchedState = Record<number, WatchedMovie>;

type MoviesContextValue = {
  watched: WatchedState;
  isHydrating: boolean;
  addOrUpdateRating: (entry: WatchedMovie) => Promise<void>;
  removeRating: (movieId: number) => Promise<void>;
  hydrate: (payload: WatchedState) => void;
  reset: () => void;
};

type MoviesAction =
  | { type: 'hydrate'; payload: WatchedState }
  | { type: 'upsert'; payload: WatchedMovie }
  | { type: 'remove'; payload: number }
  | { type: 'reset' };

type MoviesState = {
  watched: WatchedState;
  isHydrating: boolean;
};

const MoviesContext = createContext<MoviesContextValue | undefined>(undefined);

const reducer = (state: MoviesState, action: MoviesAction): MoviesState => {
  switch (action.type) {
    case 'hydrate':
      return {
        watched: action.payload,
        isHydrating: false,
      };
    case 'upsert':
      return {
        ...state,
        watched: {
          ...state.watched,
          [action.payload.movieId]: action.payload,
        },
      };
    case 'remove': {
      const updated = { ...state.watched };
      delete updated[action.payload];
      return {
        ...state,
        watched: updated,
      };
    }
    case 'reset':
      return {
        watched: {},
        isHydrating: true,
      };
    default:
      return state;
  }
};

const initialState: MoviesState = {
  watched: {},
  isHydrating: true,
};

export const MoviesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addOrUpdateRating = useCallback(async (entry: WatchedMovie): Promise<void> => {
    dispatch({ type: 'upsert', payload: entry });
  }, []);

  const removeRating = useCallback(async (movieId: number): Promise<void> => {
    dispatch({ type: 'remove', payload: movieId });
  }, []);

  const hydrate = useCallback((payload: WatchedState): void => {
    dispatch({ type: 'hydrate', payload });
  }, []);

  const reset = useCallback((): void => {
    dispatch({ type: 'reset' });
  }, []);

  const value = useMemo<MoviesContextValue>(
    () => ({
      watched: state.watched,
      isHydrating: state.isHydrating,
      addOrUpdateRating,
      removeRating,
      hydrate,
      reset,
    }),
    [state, addOrUpdateRating, removeRating, hydrate, reset],
  );

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
};

export const useMovies = (): MoviesContextValue => {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error('useMovies must be used within a MoviesProvider');
  }
  return context;
};

