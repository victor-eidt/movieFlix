import 'react-native-gesture-handler';

import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { MoviesProvider } from './src/context/MoviesContext';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => (
  <AuthProvider>
    <MoviesProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </MoviesProvider>
  </AuthProvider>
);

export default App;
