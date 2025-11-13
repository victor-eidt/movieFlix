import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

type SupabaseConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra = Constants.expoConfig?.extra as SupabaseConfig | undefined;
const resolvedSupabaseUrl = extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const resolvedSupabaseAnonKey =
  extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  resolvedSupabaseUrl || 'https://placeholder.supabase.co',
  resolvedSupabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(resolvedSupabaseUrl && resolvedSupabaseAnonKey);
};
