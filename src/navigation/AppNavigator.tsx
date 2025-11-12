import React from 'react';
import { ActivityIndicator, Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#fbbf24',
      tabBarInactiveTintColor: '#6b7280',
      tabBarShowLabel: true,
      tabBarStyle: {
        backgroundColor: '#111827',
        borderTopColor: '#374151',
        borderTopWidth: 1,
        height: Platform.select({ ios: 90, android: 80 }),
        paddingBottom: Platform.select({ ios: 25, android: 8 }),
        paddingTop: 6,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 0,
        paddingBottom: 0,
      },
      tabBarIconStyle: {
        marginTop: 0,
      },
      tabBarItemStyle: {
        paddingVertical: 0,
      },
    }}
  >
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{
        title: 'Buscar',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="search" size={size + 4} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MyWatched"
      component={MyWatchedScreen}
      options={{
        title: 'Meus Filmes',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="film" size={size + 4} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size + 4} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppStack: React.FC = () => (
  <RootStack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#111827',
      },
      headerTintColor: '#f9fafb',
      headerTitleStyle: {
        fontWeight: '700',
      },
      headerShadowVisible: false,
    }}
  >
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

  const customTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#fbbf24',
      background: '#111827',
      card: '#111827',
      text: '#f9fafb',
      border: '#374151',
      notification: '#ef4444',
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
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

