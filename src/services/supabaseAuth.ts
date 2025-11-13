import { supabase, isSupabaseConfigured } from './supabase';
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

  if (!isSupabaseConfigured()) {
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
      const errorCode = authError.code || '';
      const errorMessage = authError.message?.toLowerCase() || '';
      const isAlreadyRegistered = 
        authError.status === 422 ||
        errorCode === 'user_already_registered' ||
        errorCode === 'user_already_exists';
      
      if (isAlreadyRegistered) {
        await supabase.auth.signOut();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        
        await supabase.auth.signOut();
        
        if (!signInError && signInData?.user) {
          throw new Error('já existe um usuário cadastrado com este e-mail. Faça login em vez de se registrar.');
        }
        
        throw new Error('já existe um usuário cadastrado com este e-mail.');
      }
      
      throw new Error(authError.message || 'erro ao criar conta. Tente novamente.');
    }

    if (!authData.user) {
      throw new Error('erro ao criar conta. Tente novamente.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    let profile = null;
    let attempts = 0;
    while (!profile && attempts < 5) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profileError && profileData) {
        profile = profileData;
        break;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (!profile) {
      const user: User = {
        id: authData.user.id,
        email: normalizedEmail,
        name: trimmedName,
        avatarUri: null,
        passwordHash: '',
      };
      return { user, session: authData.session };
    }

    const user = mapSupabaseUserToDomain(profile as SupabaseUser);
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

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não está configurado. Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error('Erro no signIn do Supabase:', error);
      if (error.message.includes('invalid login credentials')) {
        throw new Error('e-mail ou senha incorretos. Tente novamente.');
      }
      throw new Error(error.message || 'erro ao fazer login. Tente novamente.');
    }

    if (!data.user) {
      throw new Error('erro ao fazer login. Tente novamente.');
    }

    let profile = null;
    let attempts = 0;
    while (!profile && attempts < 5) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profileError && profileData) {
        profile = profileData;
        break;
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (!profile) {
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: (data.user.user_metadata?.name as string) || 'Usuário',
        avatarUri: null,
        passwordHash: '',
      };
      return { user, session: data.session };
    }

    const user = mapSupabaseUserToDomain(profile as SupabaseUser);
    return { user, session: data.session };
  } catch (error) {
    console.error('Erro completo no signIn:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('erro ao fazer login. Tente novamente.');
  }
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

  let profile = null;
  let attempts = 0;
  while (!profile && attempts < 3) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profileError && profileData) {
      profile = profileData;
      break;
    }

    attempts++;
    if (attempts < 3) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  if (!profile) {
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
  let lastUserId: string | null = null;
  
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      if (event === 'SIGNED_OUT' || !session) {
        lastUserId = null;
        callback(null);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user?.id === lastUserId) {
          return;
        }
        
        lastUserId = session?.user?.id || null;
        
        let user = null;
        let attempts = 0;
        while (!user && attempts < 5) {
          user = await getCurrentUser();
          if (!user && attempts < 4) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          attempts++;
        }
        
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

