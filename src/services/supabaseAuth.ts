import { supabase } from './supabase';
import type { User } from '../types/domain';

export type SupabaseUser = {
  id: string;
  email: string;
  name: string;
  avatar_uri?: string | null;
};

const mapSupabaseUserToDomain = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  name: supabaseUser.name,
  avatarUri: supabaseUser.avatar_uri ?? null,
  passwordHash: '',
});

export const signUp = async (
  email: string,
  password: string,
  name: string,
): Promise<{ user: User; session: any }> => {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('informe um nome para concluir o cadastro.');
  }

  if (!normalizedEmail) {
    throw new Error('informe um e-mail válido.');
  }

  if (password.length < 6) {
    throw new Error('A senha deve conter pelo menos 6 caracteres.');
  }

  // Verificar se o Supabase está configurado
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase não está configurado. Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  try {
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
      console.error('Erro no signUp do Supabase:', authError);
      if (authError.message.includes('already registered') || authError.message.includes('already registered')) {
        throw new Error('já existe um usuário cadastrado com este e-mail.');
      }
      throw new Error(authError.message || 'erro ao criar conta. Tente novamente.');
    }

    if (!authData.user) {
      throw new Error('erro ao criar conta. Tente novamente.');
    }

    // Criar perfil do usuário
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: normalizedEmail,
      name: trimmedName,
      avatar_uri: null,
    });

    if (profileError) {
      console.warn('erro ao criar perfil:', profileError);
      // Não lança erro aqui, pois o usuário já foi criado no auth
      // O perfil pode ser criado depois se necessário
    }

    const user: User = {
      id: authData.user.id,
      email: normalizedEmail,
      name: trimmedName,
      avatarUri: null,
      passwordHash: '',
    };

    return { user, session: authData.session };
  } catch (error) {
    console.error('Erro completo no signUp:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('erro ao criar conta. Tente novamente.');
  }
};

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
    if (error.message.includes('invalid login credentials')) {
      throw new Error('e-mail ou senha incorretos. Tente novamente.');
    }
    throw new Error(error.message || 'erro ao fazer login. Tente novamente.');
  }

  if (!data.user) {
    throw new Error('erro ao fazer login. Tente novamente.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('erro ao carregar perfil do usuário.');
  }

  const user = mapSupabaseUserToDomain(profile as SupabaseUser);

  return { user, session: data.session };
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'erro ao fazer logout.');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

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

export const updateUserProfile = async (
  userId: string,
  updates: { name?: string; avatar_uri?: string | null },
): Promise<User> => {

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    throw new Error('usuário não autenticado ou não autorizado.');

  }

  const updateData: Partial<SupabaseUser> = {};

  if (typeof updates.name === 'string') {
    const trimmedName = updates.name.trim();
    if (!trimmedName) {
      throw new Error('informe um nome válido');
    }
    updateData.name = trimmedName;
  }

  if (typeof updates.avatar_uri !== 'undefined') {
    updateData.avatar_uri = updates.avatar_uri ?? null;
  }

  if (Object.keys(updateData).length === 0) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) {
      throw new Error('perfil não encontrado');
    }
    return mapSupabaseUserToDomain(profile as SupabaseUser);
  }

  const { data, error } = await supabase.from('profiles').update(updateData).eq('id', userId).select().single();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    if (error.code === '42501' || error.message.includes('row-level security')) {
      throw new Error(
        'erro de permissão. verifique se as políticas RLS estão configuradas corretamente no Supabase',
      );
    }
    throw new Error(error.message || 'erro ao atualizar perfil.');
  }

  if (!data) {
    throw new Error('erro ao atualizar perfil.');
  }

  return mapSupabaseUserToDomain(data as SupabaseUser);
};

export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    try {

      if (event === 'SIGNED_OUT' || !session) {
        callback(null);
        return;
      }


      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        const user = await getCurrentUser();
        callback(user);
      }
    } catch (error) {
      console.warn('Erro ao processar mudança de autenticação:', error);

      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

