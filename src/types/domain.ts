export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUri?: string | null;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  posterPath?: string | null;
  releaseDate?: string | null;
};

export type MovieDetails = Movie & {
  backdropPath?: string | null;
  genres: string[];
  homepage?: string | null;
  runtime?: number | null;
  tagline?: string | null;
  voteAverage?: number | null;
};

export type WatchedMovie = {
  movieId: number;
  rating: number;
  ratedAt: string;
  notes?: string | null;
};

