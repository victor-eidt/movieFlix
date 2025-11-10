import Constants from 'expo-constants';

type ApiConfig = {
  tmdbApiKey: string | undefined;
};

const extra = Constants.expoConfig?.extra as ApiConfig | undefined;

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const getTmdbApiKey = (): string => {
  const apiKey = extra?.tmdbApiKey;
  if (!apiKey) {
    throw new Error(
      'TMDb API key is not configured. Set EXPO_PUBLIC_TMDB_API_KEY or update app.config.ts.',
    );
  }
  return apiKey;
};

