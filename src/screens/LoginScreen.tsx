import React, { useMemo, useState } from 'react';
import {
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () => !email.trim() || !password || isSubmitting,
    [email, password, isSubmitting],
  );

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitDisabled) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : 'Não foi possível fazer login.',
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
              Bem-vindo de volta
            </Text>
            <Text style={styles.subtitle}>
              Acesse sua conta para organizar e avaliar seus filmes favoritos.
            </Text>

            <View style={styles.formField}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                accessibilityLabel="Campo de e-mail"
                accessibilityHint="Digite seu endereço de e-mail para entrar"
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
                accessibilityHint="Informe sua senha cadastrada"
                autoCapitalize="none"
                autoComplete="password"
                secureTextEntry
                placeholder="••••••••"
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
              accessibilityHint="Entra no aplicativo com o e-mail e senha informados"
              accessibilityLabel="Entrar"
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
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ir para a tela de cadastro"
              accessibilityHint="Abre a tela para criar uma nova conta"
              hitSlop={8}
              onPress={() => navigation.navigate('Register')}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.secondaryButtonText}>Criar uma conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
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
    borderColor: '#ef4444',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    color: '#f87171',
    fontSize: 16,
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

export default LoginScreen;

