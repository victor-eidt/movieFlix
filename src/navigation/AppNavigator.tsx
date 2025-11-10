import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchScreen from '../screens/SearchScreen';
import MyWatchedScreen from '../screens/MyWatchedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Search: undefined;
  MyWatched: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  MovieDetails: { movieId: number };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const AppTabs: React.FC = () => (
  <Tab.Navigator>
    <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
    <Tab.Screen
      name="MyWatched"
      component={MyWatchedScreen}
      options={{ title: 'Meus Filmes' }}
    />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
);

const AppStack: React.FC = () => (
  <RootStack.Navigator>
    <RootStack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
    <RootStack.Screen
      name="MovieDetails"
      component={MovieDetailsScreen}
      options={{ title: 'Detalhes do Filme' }}
    />
  </RootStack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DefaultTheme}>
      {user ? <AppStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default AppNavigator;

