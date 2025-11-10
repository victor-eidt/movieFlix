import axios from 'axios';

import { TMDB_BASE_URL, TMDB_IMAGE_BASE_URL, getTmdbApiKey } from '../../config/tmdb';
import type { Movie } from '../types/domain';

type SearchMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string | null;
};

type SearchMoviesResponse = {
  results: SearchMovie[];
};

const client = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
  params: {
    language: 'pt-BR',
    include_adult: false,
  },
});

client.interceptors.request.use((config) => {
  const apiKey = getTmdbApiKey();
  const params = config.params ?? {};
  return {
    ...config,
    params: {
      ...params,
      api_key: apiKey,
    },
  };
});

export const getPosterUrl = (posterPath?: string | null): string | undefined => {
  if (!posterPath) {
    return undefined;
  }
  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
};

const mapMovie = (movie: SearchMovie): Movie => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.poster_path,
  releaseDate: movie.release_date,
});

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  if (!query.trim()) {
    return [];
  }

  const response = await client.get<SearchMoviesResponse>('/search/movie', {
    params: {
      query,
      page,
    },
  });

  return response.data.results.map(mapMovie);
};

