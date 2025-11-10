import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const LoginScreen: React.FC = () => (
  <View style={styles.container}>
    <Text accessibilityRole="header">Login</Text>
    <Text>Interface de login será implementada posteriormente.</Text>
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

export default LoginScreen;

