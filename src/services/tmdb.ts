import axios from 'axios';

import {
  TMDB_BACKDROP_BASE_URL,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
  getTmdbApiKey,
} from '../../config/tmdb';
import type { Movie, MovieDetails } from '../types/domain';

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

type MovieGenreResponse = {
  id: number;
  name: string;
};

type MovieDetailsResponse = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  runtime: number | null;
  tagline: string | null;
  homepage: string | null;
  vote_average: number | null;
  genres: MovieGenreResponse[];
};

const client = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 8000,
  params: {
    include_adult: false,
    language: 'pt-BR',
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

export const getBackdropUrl = (backdropPath?: string | null): string | undefined => {
  if (!backdropPath) {
    return undefined;
  }
  return `${TMDB_BACKDROP_BASE_URL}${backdropPath}`;
};

const mapMovie = (movie: SearchMovie): Movie => ({
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  posterPath: movie.poster_path,
  releaseDate: movie.release_date,
});

const mapMovieDetails = (data: MovieDetailsResponse): MovieDetails => ({
  id: data.id,
  title: data.title,
  overview: data.overview,
  posterPath: data.poster_path,
  backdropPath: data.backdrop_path,
  releaseDate: data.release_date,
  runtime: data.runtime,
  tagline: data.tagline,
  homepage: data.homepage,
  voteAverage: data.vote_average,
  genres: data.genres?.map((genre) => genre.name) ?? [],
});

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  if (!query.trim()) {
    return [];
  }

  const response = await client.get<SearchMoviesResponse>('/search/movie', {
    params: {
      page,
      query,
    },
  });

  return response.data.results.map(mapMovie);
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails> => {
  const response = await client.get<MovieDetailsResponse>(`/movie/${movieId}`);
  return mapMovieDetails(response.data);
};

