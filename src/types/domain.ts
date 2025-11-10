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

export type WatchedMovie = {
  movieId: number;
  rating: number;
  ratedAt: string;
  notes?: string | null;
};

