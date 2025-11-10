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
    infoPlist: {
      NSCameraUsageDescription: 'Precisamos da câmera para que você possa tirar uma foto de perfil.',
      NSPhotoLibraryUsageDescription:
        'Precisamos acessar suas fotos para escolher uma imagem de perfil.',
      NSPhotoLibraryAddUsageDescription:
        'Precisamos salvar a foto capturada para usá-la como imagem de perfil.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['CAMERA', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    ...config.extra,
    tmdbApiKey: TMDB_API_KEY,
  },
});

