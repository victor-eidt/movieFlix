import { supabase } from './supabase';
import type { User } from '../types/domain';

export type SupabaseUser = {
  id: string;
  email: string;
  name: string;
  avatar_uri?: string | null;
};

/**
 * Converte o usuário do Supabase para o formato do domínio
 */
const mapSupabaseUserToDomain = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  name: supabaseUser.name,
  avatarUri: supabaseUser.avatar_uri ?? null,
  passwordHash: '', // Não armazenamos mais hash localmente
});

/**
 * Registra um novo usuário no Supabase
 */
export const signUp = async (
  email: string,
  password: string,
  name: string,
): Promise<{ user: User; session: any }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Informe um nome para concluir o cadastro.');
  }

  if (!normalizedEmail) {
    throw new Error('Informe um e-mail válido.');
  }

  if (password.length < 6) {
    throw new Error('A senha deve conter pelo menos 6 caracteres.');
  }

  // Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: trimmedName,
      },
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw new Error('Já existe um usuário cadastrado com este e-mail.');
    }
    throw new Error(authError.message || 'Erro ao criar conta. Tente novamente.');
  }

  if (!authData.user) {
    throw new Error('Erro ao criar conta. Tente novamente.');
  }

  // Criar perfil do usuário na tabela profiles
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    email: normalizedEmail,
    name: trimmedName,
    avatar_uri: null,
  });

  if (profileError) {
    console.warn('Erro ao criar perfil:', profileError);
    // Não falhamos aqui, pois o usuário já foi criado no auth
  }

  const user: User = {
    id: authData.user.id,
    email: normalizedEmail,
    name: trimmedName,
    avatarUri: null,
    passwordHash: '',
  };

  return { user, session: authData.session };
};

/**
 * Faz login do usuário no Supabase
 */
export const signIn = async (email: string, password: string): Promise<{ user: User; session: any }> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error('Informe e-mail e senha para continuar.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('E-mail ou senha incorretos. Tente novamente.');
    }
    throw new Error(error.message || 'Erro ao fazer login. Tente novamente.');
  }

  if (!data.user) {
    throw new Error('Erro ao fazer login. Tente novamente.');
  }

  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Erro ao carregar perfil do usuário.');
  }

  const user = mapSupabaseUserToDomain(profile as SupabaseUser);

  return { user, session: data.session };
};

/**
 * Faz logout do usuário
 */
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Erro ao fazer logout.');
  }
};

/**
 * Obtém o usuário atual da sessão
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Buscar perfil do usuário
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return mapSupabaseUserToDomain(profile as SupabaseUser);
};

/**
 * Atualiza o perfil do usuário
 */
export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; avatar_uri?: string | null },
): Promise<User> => {
  // Verificar se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error('Usuário não autenticado ou não autorizado.');
  }

  const updateData: Partial<SupabaseUser> = {};

  if (typeof updates.name === 'string') {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      throw new Error('Informe um nome válido.');
    }
    updateData.name = trimmedName;
  }

  if (typeof updates.avatar_uri !== 'undefined') {
    updateData.avatar_uri = updates.avatar_uri ?? null;
  }

  if (Object.keys(updateData).length === 0) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) {
      throw new Error('Perfil não encontrado.');
    }
    return mapSupabaseUserToDomain(profile as SupabaseUser);
  }

  const { data, error } = await supabase.from('profiles').update(updateData).eq('id', userId).select().single();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error(
        'Erro de permissão. Verifique se as políticas RLS estão configuradas corretamente no Supabase.',
      );
    }
    throw new Error(error.message || 'Erro ao atualizar perfil.');
  }

  if (!data) {
    throw new Error('Erro ao atualizar perfil.');
  }

  return mapSupabaseUserToDomain(data as SupabaseUser);
};

/**
 * Escuta mudanças na sessão de autenticação
 */
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      callback(null);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      const user = await getCurrentUser();
      callback(user);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

