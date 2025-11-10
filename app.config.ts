import { ExpoConfig, ConfigContext } from 'expo/config';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? 'e26281e4d3048c378ce3b2805f426fc6';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'movieFlix',
  slug: 'movieFlix',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    ...config.extra,
    tmdbApiKey: TMDB_API_KEY,
  },
});

