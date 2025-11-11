import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/tmdb';
import type { Movie } from '../types/domain';
import type { RootStackParamList } from '../navigation/AppNavigator';

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const requestIdRef = useRef(0);

  const performSearch = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        setResults([]);
        setErrorMessage(null);
        setHasSearched(false);
        return;
      }

      const currentRequestId = requestIdRef.current + 1;
      requestIdRef.current = currentRequestId;

      setIsLoading(true);
      setErrorMessage(null);
      setHasSearched(true);

      try {
        const movies = await searchMovies(trimmed);
        if (requestIdRef.current === currentRequestId) {
          setResults(movies);
        }
      } catch (error) {
        if (requestIdRef.current === currentRequestId) {
          console.warn('Erro ao buscar filmes', error);
          setErrorMessage('Não foi possível buscar filmes agora. Tente novamente mais tarde.');
          setResults([]);
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      void performSearch(query);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [performSearch, query]);

  const handleSubmitEditing = useCallback(() => {
    Keyboard.dismiss();
    void performSearch(query);
  }, [performSearch, query]);

  const headerDescription = useMemo(() => {
    if (!hasSearched) {
      return 'Procure por qualquer título disponível no catálogo da TMDb.';
    }

    if (isLoading) {
      return 'Buscando filmes...';
    }

    if (errorMessage) {
      return 'Ocorreu um problema ao carregar os resultados.';
    }

    if (results.length === 0) {
      return 'Nenhum resultado encontrado para a busca realizada.';
    }

    return `${results.length} resultado(s) encontrado(s).`;
  }, [errorMessage, hasSearched, isLoading, results.length]);

  useEffect(() => {
    if (!hasSearched || isLoading) {
      return;
    }

    AccessibilityInfo.announceForAccessibility(headerDescription).catch((error) => {
      console.warn('Failed to announce search status', error);
    });
  }, [headerDescription, hasSearched, isLoading]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Buscar Filmes
            </Text>
            <Text style={styles.subtitle}>{headerDescription}</Text>
          </View>

          <TextInput
            accessibilityHint="Digite o título do filme que deseja pesquisar"
            accessibilityLabel="Campo de busca por filmes"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Ex.: O Senhor dos Anéis"
            placeholderTextColor="#6b7280"
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmitEditing}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          {isLoading && (
            <View style={styles.loadingContainer} accessible accessibilityRole="progressbar">
              <ActivityIndicator color="#fbbf24" size="large" />
              <Text style={styles.loadingText}>Carregando resultados...</Text>
            </View>
          )}

          <FlatList
            accessibilityRole="list"
            contentContainerStyle={styles.listContent}
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              hasSearched && !isLoading && !errorMessage ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Não encontramos filmes para esta busca. Tente outro título.
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <MovieCard
                overview={item.overview}
                posterPath={item.posterPath}
                releaseDate={item.releaseDate}
                title={item.title}
                onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
              />
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
  },
  error: {
    color: '#f87171',
    fontSize: 14,
  },
  flex: {
    flex: 1,
  },
  header: {
    gap: 8,
  },
  listContent: {
    flexGrow: 1,
    gap: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  loadingText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  safeArea: {
    backgroundColor: '#0f172a',
    flex: 1,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    color: '#f9fafb',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
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

export default SearchScreen;

