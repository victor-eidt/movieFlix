import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MovieCard from '../components/MovieCard';
import { useMovies } from '../context/MoviesContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getMovieDetails } from '../services/tmdb';
import type { MovieDetails } from '../types/domain';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

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

const MyWatchedScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { watched, isHydrating } = useMovies();

  const [detailsMap, setDetailsMap] = useState<Record<number, MovieDetails | null>>({});
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fetchedIdsRef = useRef<Set<number>>(new Set());

  const watchedList = useMemo(() => {
    return Object.values(watched).sort((a, b) => {
      const dateA = new Date(a.ratedAt).getTime();
      const dateB = new Date(b.ratedAt).getTime();
      return dateB - dateA;
    });
  }, [watched]);

  useEffect(() => {
    setDetailsMap((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!watched[Number(id)]) {
          delete next[Number(id)];
          fetchedIdsRef.current.delete(Number(id));
        }
      });
      return next;
    });
  }, [watched]);

  useEffect(() => {
    let cancelled = false;

    const idsToFetch = watchedList
      .map((item) => item.movieId)
      .filter((id) => !fetchedIdsRef.current.has(id));

    if (idsToFetch.length === 0) {
      if (!watchedList.length) {
        setIsFetchingDetails(false);
      }
      return () => {
        cancelled = true;
      };
    }

    const fetchDetails = async () => {
      setIsFetchingDetails(true);
      setFetchError(null);
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const data = await getMovieDetails(id);
              return { id, data };
            } catch (error) {
              console.warn(`Failed to load movie details for id=${id}`, error);
              return { id, data: null as MovieDetails | null, error: true };
            }
          }),
        );

        if (cancelled) {
          return;
        }

        const hasErrors = results.some((result) => result.error);
        if (hasErrors) {
          setFetchError('Alguns filmes não foram carregados. Puxe para atualizar e tentar novamente.');
        }

        setDetailsMap((prev) => {
          const next = { ...prev };
          results.forEach(({ id, data }) => {
            next[id] = data;
            fetchedIdsRef.current.add(id);
          });
          return next;
        });
      } finally {
        if (!cancelled) {
          setIsFetchingDetails(false);
        }
      }
    };

    void fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [watchedList]);

  const handleRefresh = useCallback(() => {
    setFetchError(null);
    setDetailsMap({});
    fetchedIdsRef.current.clear();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            accessibilityLabel="Atualizar lista de filmes assistidos"
            accessibilityHint="Puxe a tela para baixo para recarregar os detalhes dos filmes"
            colors={['#fbbf24']}
            refreshing={isFetchingDetails}
            onRefresh={handleRefresh}
          />
        }
      >
        <Text accessibilityRole="header" style={styles.title}>
          Meus Filmes Assistidos
        </Text>
        <Text style={styles.subtitle}>
          Veja todos os filmes que você já avaliou. Toque em um item para revisar os detalhes ou
          atualizar a nota.
        </Text>

        {isHydrating ? (
          <View style={styles.feedbackContainer}>
            <ActivityIndicator color="#fbbf24" size="large" />
            <Text style={styles.feedbackText}>Carregando seus filmes...</Text>
          </View>
        ) : watchedList.length === 0 ? (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              Você ainda não avaliou nenhum filme. Busque por um título e salve sua avaliação.
            </Text>
          </View>
        ) : (
          watchedList.map((entry) => {
            const movie = detailsMap[entry.movieId];
            const title = movie?.title ?? `Filme #${entry.movieId}`;
            const overview = movie?.overview ?? 'Detalhes não disponíveis.';
            const posterPath = movie?.posterPath ?? null;
            const releaseDate = movie?.releaseDate ?? null;
            return (
              <View key={entry.movieId} style={styles.cardWrapper}>
                <MovieCard
                  overview={overview}
                  posterPath={posterPath}
                  releaseDate={releaseDate}
                  title={title}
                  onPress={() => navigation.navigate('MovieDetails', { movieId: entry.movieId })}
                />
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataText}>
                    {`Minha nota: ${entry.rating} estrela${entry.rating > 1 ? 's' : ''}`}
                  </Text>
                  <Text style={styles.metadataText}>
                    {`Avaliado em ${formatRatedAt(entry.ratedAt)}`}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {fetchError ? <Text style={styles.error}>{fetchError}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    gap: 8,
  },
  container: {
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  error: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  feedbackText: {
    color: '#cbd5f5',
    fontSize: 14,
    textAlign: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  metadataText: {
    color: '#e2e8f0',
    fontSize: 13,
  },
  safeArea: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
});

export default MyWatchedScreen;

