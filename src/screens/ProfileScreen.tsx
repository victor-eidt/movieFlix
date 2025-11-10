import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ProfileScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Perfil</Text>
    <Text>Detalhes do usuário logado serão exibidos aqui.</Text>
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

export default ProfileScreen;

