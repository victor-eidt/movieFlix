import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SearchScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Buscar Filmes</Text>
    <Text>A busca pela API do TMDb será implementada nesta tela.</Text>
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

export default SearchScreen;

