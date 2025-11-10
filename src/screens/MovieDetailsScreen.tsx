import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MovieDetailsScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Detalhes do Filme</Text>
    <Text>Os detalhes e avaliações do filme serão exibidos aqui.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default MovieDetailsScreen;

