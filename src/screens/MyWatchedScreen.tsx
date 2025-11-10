import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MyWatchedScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Meus Filmes Assistidos</Text>
    <Text>A lista de filmes avaliados aparecerá nesta tela.</Text>
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

export default MyWatchedScreen;

