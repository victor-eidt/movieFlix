import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const RegisterScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Cadastro</Text>
    <Text>Formulário de cadastro será adicionado nesta tela.</Text>
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

export default RegisterScreen;

