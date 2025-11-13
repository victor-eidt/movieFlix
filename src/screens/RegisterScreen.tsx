import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectingPhoto, setIsSelectingPhoto] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return !name.trim() || !email.trim() || password.length < 6 || isSubmitting;
  }, [name, email, password, isSubmitting]);

  const selectFromLibrary = async (): Promise<void> => {
    if (isSelectingPhoto) {
      return;
    }
    try {
      setIsSelectingPhoto(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para escolher uma foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        setAvatarUri(result.assets[0]?.uri ?? null);
      }
    } catch (pickerError) {
      console.warn('Erro ao selecionar imagem', pickerError);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setIsSelectingPhoto(false);
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (isSelectingPhoto) {
      return;
    }
    try {
      setIsSelectingPhoto(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert('Permissão necessária', 'Autorize o uso da câmera para tirar uma foto.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        setAvatarUri(result.assets[0]?.uri ?? null);
      }
    } catch (cameraError) {
      console.warn('Erro ao capturar imagem', cameraError);
      Alert.alert('Erro', 'Não foi possível capturar a imagem.');
    } finally {
      setIsSelectingPhoto(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitDisabled) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Timeout de segurança: se demorar mais de 30 segundos, cancela
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão e tente novamente.')), 30000);
      });

      await Promise.race([
        register({
          name: name.trim(),
          email: email.trim(),
          password,
          avatarUri,
        }),
        timeoutPromise,
      ]) as Promise<void>;
    } catch (authError) {
      console.error('Erro no cadastro:', authError);
      setError(
        authError instanceof Error
          ? authError.message
          : 'Não foi possível concluir o cadastro.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>
              Crie sua conta
            </Text>
            <Text style={styles.subtitle}>
              Cadastre-se para montar seu catálogo pessoal de filmes assistidos.
            </Text>

            <View style={styles.avatarSection}>
              {avatarUri ? (
                <Image
                  accessibilityLabel="Foto de perfil selecionada"
                  accessibilityHint="Toque nos botões abaixo para alterar a foto de perfil"
                  accessibilityIgnoresInvertColors
                  source={{ uri: avatarUri }}
                  style={styles.avatar}
                />
              ) : (
                <View
                  accessible
                  accessibilityHint="Nenhuma foto escolhida. Use os botões abaixo para selecionar"
                  accessibilityLabel="Foto de perfil não selecionada"
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarPlaceholderText}>Foto de perfil</Text>
                </View>
              )}
              <View style={styles.avatarButtons}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Escolher foto da galeria"
                  accessibilityHint="Abre a galeria de imagens do dispositivo"
                  hitSlop={8}
                  onPress={selectFromLibrary}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                    isSelectingPhoto && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isSelectingPhoto ? 'Aguarde...' : 'Galeria'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tirar foto com a câmera"
                  accessibilityHint="Abre a câmera do dispositivo para capturar uma nova foto"
                  hitSlop={8}
                  onPress={takePhoto}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                    isSelectingPhoto && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>
                    {isSelectingPhoto ? 'Aguarde...' : 'Câmera'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                accessibilityLabel="Campo de nome completo"
                accessibilityHint="Digite seu nome como deseja que apareça no perfil"
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Seu nome"
                placeholderTextColor="#6b7280"
                returnKeyType="next"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                accessibilityLabel="Campo de e-mail"
                accessibilityHint="Informe um e-mail válido para acessar sua conta"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                inputMode="email"
                keyboardType="email-address"
                placeholder="seunome@email.com"
                placeholderTextColor="#6b7280"
                returnKeyType="next"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                accessibilityLabel="Campo de senha"
                accessibilityHint="Crie uma senha com pelo menos seis caracteres"
                autoCapitalize="none"
                autoComplete="password-new"
                secureTextEntry
                placeholder="Mínimo de 6 caracteres"
                placeholderTextColor="#6b7280"
                returnKeyType="done"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <Pressable
              accessibilityHint="Finaliza o cadastro com os dados informados"
              accessibilityLabel="Concluir cadastro"
              accessibilityRole="button"
              disabled={isSubmitDisabled}
              hitSlop={8}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                isSubmitDisabled && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Retornar para a tela de login"
              accessibilityHint="Volta para a tela inicial de acesso"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.linkButtonText}>Já tenho conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    gap: 16,
    padding: 24,
  },
  errorMessage: {
    color: '#f87171',
    fontSize: 14,
  },
  flex: {
    flex: 1,
  },
  formField: {
    gap: 8,
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderRadius: 8,
    borderWidth: 1,
    color: '#f9fafb',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkButtonText: {
    color: '#93c5fd',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
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

export default RegisterScreen;

