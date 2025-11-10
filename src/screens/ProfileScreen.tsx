import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();

  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const hasAvatar = useMemo(() => Boolean(user?.avatarUri), [user?.avatarUri]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text accessibilityRole="header" style={styles.emptyTitle}>
            Nenhum usuário ativo
          </Text>
          <Text style={styles.emptyMessage}>
            Faça login novamente para visualizar o seu perfil.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectFromLibrary = async (): Promise<void> => {
    if (isUpdatingPhoto) {
      return;
    }

    try {
      setIsUpdatingPhoto(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso à galeria para alterar sua foto de perfil.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0]?.uri ?? null;
        await updateProfile({ avatarUri: uri });
      }
    } catch (error) {
      console.warn('Erro ao selecionar imagem', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleTakePhoto = async (): Promise<void> => {
    if (isUpdatingPhoto) {
      return;
    }

    try {
      setIsUpdatingPhoto(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o uso da câmera para tirar uma nova foto de perfil.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const uri = result.assets[0]?.uri ?? null;
        await updateProfile({ avatarUri: uri });
      }
    } catch (error) {
      console.warn('Erro ao capturar imagem', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleRemovePhoto = async (): Promise<void> => {
    if (!hasAvatar || isUpdatingPhoto) {
      return;
    }

    try {
      setIsUpdatingPhoto(true);
      await updateProfile({ avatarUri: null });
    } catch (error) {
      console.warn('Erro ao remover foto de perfil', error);
      Alert.alert('Erro', 'Não foi possível remover a foto de perfil.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const confirmLogout = (): void => {
    Alert.alert('Encerrar sessão', 'Deseja realmente sair do aplicativo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await logout();
          } catch (error) {
            console.warn('Erro ao fazer logout', error);
            Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            Meu Perfil
          </Text>
          <Text style={styles.subtitle}>Gerencie suas informações pessoais.</Text>

          <View style={styles.avatarSection}>
            {hasAvatar ? (
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel={`Foto de perfil de ${user.name}`}
                accessibilityHint="Imagem atual de perfil"
                accessibilityRole="image"
                source={{ uri: user.avatarUri ?? undefined }}
                style={styles.avatar}
              />
            ) : (
              <View
                accessible
                accessibilityHint="Nenhuma foto cadastrada. Use os botões abaixo para adicionar."
                accessibilityLabel="Foto de perfil não cadastrada"
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarPlaceholderText}>Foto de perfil</Text>
              </View>
            )}

            <View style={styles.avatarButtons}>
              <Pressable
                accessibilityHint="Abre a galeria de imagens do dispositivo"
                accessibilityLabel="Escolher foto da galeria"
                accessibilityRole="button"
                disabled={isUpdatingPhoto}
                hitSlop={8}
                onPress={handleSelectFromLibrary}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                  isUpdatingPhoto && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  {isUpdatingPhoto ? 'Aguarde...' : 'Galeria'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityHint="Abre a câmera para tirar uma nova foto de perfil"
                accessibilityLabel="Tirar foto com a câmera"
                accessibilityRole="button"
                disabled={isUpdatingPhoto}
                hitSlop={8}
                onPress={handleTakePhoto}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                  isUpdatingPhoto && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  {isUpdatingPhoto ? 'Aguarde...' : 'Câmera'}
                </Text>
              </Pressable>
            </View>

            {hasAvatar ? (
              <Pressable
                accessibilityHint="Remove sua foto de perfil atual"
                accessibilityLabel="Remover foto de perfil"
                accessibilityRole="button"
                disabled={isUpdatingPhoto}
                hitSlop={8}
                onPress={handleRemovePhoto}
                style={({ pressed }) => [
                  styles.linkButton,
                  pressed && styles.buttonPressed,
                  isUpdatingPhoto && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.linkButtonText}>Remover foto</Text>
              </Pressable>
            ) : null}
          </View>

          <View accessible accessibilityRole="text" style={styles.infoSection}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>

          <View accessible accessibilityRole="text" style={styles.infoSection}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <Pressable
            accessibilityHint="Encerra sua sessão e retorna à tela de login"
            accessibilityLabel="Sair do aplicativo"
            accessibilityRole="button"
            disabled={isLoggingOut}
            hitSlop={8}
            onPress={confirmLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.buttonPressed,
              isLoggingOut && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.logoutButtonText}>
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderRadius: 60,
    borderWidth: 1,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  avatarPlaceholderText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    gap: 24,
    padding: 24,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyMessage: {
    color: '#d1d5db',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  infoSection: {
    gap: 4,
  },
  infoValue: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkButtonText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutButtonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: '#111827',
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#fbbf24',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: 14,
  },
  title: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
  },
});

export default ProfileScreen;

