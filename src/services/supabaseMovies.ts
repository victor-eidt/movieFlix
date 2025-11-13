import { supabase } from './supabase';
import type { WatchedMovie } from '../types/domain';

export const getWatchedMovies = async (userId: string): Promise<WatchedMovie[]> => {
  const { data, error } = await supabase
    .from('watched_movies')
    .select('*')
    .eq('user_id', userId)
    .order('rated_at', { ascending: false });

  if (error) {
    console.warn('erro ao buscar filmes assistidos:', error);
    return [];
  }

  return (
    data?.map((item) => ({
      movieId: item.movie_id,
      rating: item.rating,
      ratedAt: item.rated_at,
      notes: item.notes ?? null,
    })) ?? []
  );
};


export const upsertWatchedMovie = async (userId: string, movie: WatchedMovie): Promise<void> => {

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error('usuario não autenticado ou não autorizado.');
  }

  const { error } = await supabase.from('watched_movies').upsert(
    {
      user_id: userId,
      movie_id: movie.movieId,
      rating: movie.rating,
      rated_at: movie.ratedAt,
      notes: movie.notes ?? null,
    },
    {
      onConflict: 'user_id,movie_id',
    },
  );

  if (error) {
    console.error('erro ao salvar filme', error);
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error(
        'erro de permissão tentar verificar as policys rls no supabase',
      );
    }
    throw new Error(error.message || 'erro ao salvar filme assistido');
  }
};

export const removeWatchedMovie = async (userId: string, movieId: number): Promise<void> => {
  const { error } = await supabase.from('watched_movies').delete().eq('user_id', userId).eq('movie_id', movieId);

  if (error) {
    throw new Error(error.message || 'erro ao remover filme assistido');
  }
};

