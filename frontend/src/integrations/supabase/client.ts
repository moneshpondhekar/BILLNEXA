import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') return false;
  // Check for placeholder or template string
  if (supabaseUrl.includes('your-project-id') || supabaseUrl.includes('placeholder')) return false;
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.info('[Bill Nexa] Supabase client initialized successfully with live project URL:', supabaseUrl);
  } catch (err) {
    console.warn('[Bill Nexa] Failed to initialize Supabase client:', err);
    clientInstance = null;
  }
} else {
  console.info('[Bill Nexa] Running in Local Demonstration Mode. Supabase environment variables not detected or unconfigured.');
}

export const supabase = clientInstance;
