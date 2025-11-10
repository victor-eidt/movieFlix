import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getPosterUrl } from '../services/tmdb';

type Props = {
  title: string;
  overview?: string | null;
  posterPath?: string | null;
  releaseDate?: string | null;
  onPress: () => void;
};

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

const MovieCard: React.FC<Props> = ({ title, overview, posterPath, releaseDate, onPress }) => {
  const formattedReleaseDate = formatReleaseDate(releaseDate);
  const posterUrl = getPosterUrl(posterPath ?? undefined);

  return (
    <Pressable
      accessibilityHint="Abre a tela de detalhes do filme"
      accessibilityLabel={`Ver detalhes do filme ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {posterUrl ? (
        <Image
          accessibilityLabel={`Pôster do filme ${title}`}
          accessibilityHint="Imagem ilustrativa do filme"
          accessibilityIgnoresInvertColors
          accessibilityRole="image"
          source={{ uri: posterUrl }}
          style={styles.poster}
        />
      ) : (
        <View
          accessible
          accessibilityHint="Imagem indisponível para este filme"
          accessibilityLabel={`Pôster indisponível para o filme ${title}`}
          accessibilityIgnoresInvertColors
          style={styles.posterPlaceholder}
        >
          <Text style={styles.posterPlaceholderText}>Sem pôster</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {formattedReleaseDate ? (
          <Text style={styles.releaseDate}>Lançamento: {formattedReleaseDate}</Text>
        ) : null}
        {overview ? (
          <Text numberOfLines={3} style={styles.overview}>
            {overview}
          </Text>
        ) : (
          <Text style={styles.overviewPlaceholder}>Sinopse não disponível.</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 16,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 8,
    paddingRight: 12,
    paddingVertical: 12,
  },
  overview: {
    color: '#d1d5db',
    fontSize: 13,
  },
  overviewPlaceholder: {
    color: '#9ca3af',
    fontSize: 13,
    fontStyle: 'italic',
  },
  poster: {
    height: 140,
    width: 95,
  },
  posterPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: 95,
  },
  posterPlaceholderText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  releaseDate: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default React.memo(MovieCard);

