import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  AccessibilityInfo,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import RatingStars from '../components/RatingStars';
import { useMovies } from '../context/MoviesContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getBackdropUrl, getMovieDetails, getPosterUrl } from '../services/tmdb';
import type { MovieDetails } from '../types/domain';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetails'>;

const formatReleaseDate = (releaseDate?: string | null): string | null => {
  if (!releaseDate) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(releaseDate));
  } catch (error) {
    console.warn('Invalid release date', releaseDate, error);
    return null;
  }
};

const formatRuntime = (runtime?: number | null): string | null => {
  if (!runtime || runtime <= 0) {
    return null;
  }
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const segments = [];
  if (hours > 0) {
    segments.push(`${hours}h`);
  }
  if (minutes > 0) {
    segments.push(`${minutes}min`);
  }
  return segments.join(' ');
};

const formatRatedAt = (timestamp: string): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(timestamp));
  } catch (error) {
    console.warn('Invalid ratedAt date', timestamp, error);
    return timestamp;
  }
};

const MovieDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId } = route.params;
  const { watched, addOrUpdateRating, removeRating } = useMovies();
  const existingEntry = watched[movieId];

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(existingEntry?.rating ?? 0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const releaseDate = useMemo(
    () => formatReleaseDate(movie?.releaseDate),
    [movie?.releaseDate],
  );
  const runtime = useMemo(() => formatRuntime(movie?.runtime), [movie?.runtime]);

  useEffect(() => {
    setRating(existingEntry?.rating ?? 0);
  }, [existingEntry?.rating]);

  useLayoutEffect(() => {
    if (movie?.title) {
      navigation.setOptions({ title: movie.title });
    }
  }, [movie?.title, navigation]);

  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const details = await getMovieDetails(movieId);
        if (!active) {
          return;
        }
        setMovie(details);
      } catch (error) {
        console.warn('Failed to fetch movie details', error);
        if (active) {
          setErrorMessage('Não foi possível carregar os detalhes do filme.');
          setMovie(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      active = false;
    };
  }, [movieId, reloadKey]);

  const handleRetry = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  const handleSaveRating = useCallback(async () => {
    if (rating <= 0) {
      setStatusType('error');
      setStatusMessage('Selecione uma nota antes de salvar.');
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage(null);
      setStatusType(null);
      const entry = {
        movieId,
        rating,
        ratedAt: new Date().toISOString(),
      };
      await addOrUpdateRating(entry);
      setStatusType('success');
      setStatusMessage('Filme salvo na sua lista de assistidos.');
      AccessibilityInfo.announceForAccessibility('Filme salvo na sua lista de assistidos.');
    } catch (error) {
      console.warn('Failed to save movie rating', error);
      setStatusType('error');
      setStatusMessage(
        error instanceof Error ? error.message : 'Não foi possível salvar a avaliação.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [addOrUpdateRating, movieId, rating]);

  const handleRemoveRating = useCallback(async () => {
    try {
      setIsRemoving(true);
      setStatusMessage(null);
      setStatusType(null);
      await removeRating(movieId);
      setStatusType('success');
      setStatusMessage('Avaliação removida da sua lista.');
      AccessibilityInfo.announceForAccessibility('Avaliação removida da sua lista.');
    } catch (error) {
      console.warn('Failed to remove movie rating', error);
      setStatusType('error');
      setStatusMessage('Não foi possível remover a avaliação.');
    } finally {
      setIsRemoving(false);
    }
  }, [movieId, removeRating]);

  const posterUrl = getPosterUrl(movie?.posterPath);
  const backdropUrl = getBackdropUrl(movie?.backdropPath);

  const genres = movie?.genres ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color="#fbbf24" size="large" />
            <Text style={styles.loadingText}>Carregando detalhes...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable
              accessibilityHint="Tenta novamente carregar os detalhes do filme"
              accessibilityLabel="Tentar novamente"
              accessibilityRole="button"
              onPress={handleRetry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : movie ? (
          <View style={styles.content}>
            {backdropUrl ? (
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="Imagem ilustrativa do filme"
                accessibilityHint="Imagem de destaque do filme"
                accessibilityRole="image"
                source={{ uri: backdropUrl }}
                style={styles.backdrop}
              />
            ) : null}

            <View style={styles.header}>
              {posterUrl ? (
                <Image
                  accessibilityIgnoresInvertColors
                  accessibilityLabel={`Pôster do filme ${movie.title}`}
                  accessibilityHint="Imagem oficial do filme"
                  accessibilityRole="image"
                  source={{ uri: posterUrl }}
                  style={styles.poster}
                />
              ) : (
                <View
                  accessible
                  accessibilityHint="Imagem indisponível para este filme"
                  accessibilityLabel="Pôster não disponível"
                  style={styles.posterPlaceholder}
                >
                  <Text style={styles.posterPlaceholderText}>Sem pôster</Text>
                </View>
              )}

              <View style={styles.headerText}>
                <Text accessibilityRole="header" style={styles.title}>
                  {movie.title}
                </Text>
                {movie.tagline ? (
                  <Text style={styles.tagline}>“{movie.tagline}”</Text>
                ) : null}
                <View style={styles.metaRow}>
                  {releaseDate ? (
                    <Text style={styles.metaItem}>Lançamento: {releaseDate}</Text>
                  ) : null}
                  {runtime ? <Text style={styles.metaItem}>Duração: {runtime}</Text> : null}
                  {movie.voteAverage ? (
                    <Text style={styles.metaItem}>
                      Nota TMDb: {movie.voteAverage.toFixed(1)}/10
                    </Text>
                  ) : null}
                </View>
                {genres.length > 0 ? (
                  <Text style={styles.genres}>{genres.join(' • ')}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sinopse</Text>
              {movie.overview ? (
                <Text style={styles.overview}>{movie.overview}</Text>
              ) : (
                <Text style={styles.overviewPlaceholder}>Sinopse não disponível.</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sua avaliação</Text>
              {existingEntry ? (
                <Text style={styles.currentRatingInfo}>
                  Você avaliou este filme com nota {existingEntry.rating} em{' '}
                  {formatRatedAt(existingEntry.ratedAt)}.
                </Text>
              ) : null}
              <RatingStars disabled={isSaving || isRemoving} value={rating} onChange={setRating} />
              <Text style={styles.ratingHelper}>
                {rating > 0
                  ? `Nota selecionada: ${rating} estrela${rating > 1 ? 's' : ''}.`
                  : 'Selecione uma nota entre zero e cinco estrelas.'}
              </Text>
              {statusMessage ? (
                <Text
                  style={[
                    styles.statusMessage,
                    statusType === 'error' ? styles.statusError : styles.statusSuccess,
                  ]}
                >
                  {statusMessage}
                </Text>
              ) : null}
              <Pressable
                accessibilityHint="Salva ou atualiza sua avaliação para este filme"
                accessibilityLabel={existingEntry ? 'Atualizar avaliação' : 'Salvar avaliação'}
                accessibilityRole="button"
                disabled={rating <= 0 || isSaving}
                onPress={handleSaveRating}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  (rating <= 0 || isSaving) && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {isSaving
                    ? 'Salvando...'
                    : existingEntry
                      ? 'Atualizar avaliação'
                      : 'Salvar na minha lista'}
                </Text>
              </Pressable>

              {existingEntry ? (
                <Pressable
                  accessibilityHint="Remove este filme da sua lista de assistidos"
                  accessibilityLabel="Remover avaliação"
                  accessibilityRole="button"
                  disabled={isRemoving}
                  onPress={handleRemoveRating}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                    isRemoving && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isRemoving ? 'Removendo...' : 'Remover da lista'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    borderRadius: 12,
    height: 180,
    marginBottom: 16,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  centerContent: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    minHeight: 280,
    padding: 24,
  },
  content: {
    gap: 28,
    paddingHorizontal: 20,
    width: '100%',
  },
  currentRatingInfo: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  errorText: {
    color: '#f87171',
    fontSize: 15,
    textAlign: 'center',
  },
  genres: {
    color: '#e5e7eb',
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  loadingText: {
    color: '#e5e7eb',
    fontSize: 15,
  },
  metaItem: {
    color: '#eab308',
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  overview: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  overviewPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  poster: {
    borderRadius: 12,
    height: 160,
    width: 110,
  },
  posterPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    height: 160,
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: 110,
  },
  posterPlaceholderText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  ratingHelper: {
    color: '#cbd5f5',
    fontSize: 13,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#e0f2fe',
    fontSize: 15,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#f87171',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  statusError: {
    color: '#fca5a5',
  },
  statusMessage: {
    fontSize: 13,
  },
  statusSuccess: {
    color: '#86efac',
  },
  tagline: {
    color: '#cbd5f5',
    fontStyle: 'italic',
  },
  title: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
  },
});

export default MovieDetailsScreen;

