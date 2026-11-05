import { supabase, isSupabaseConfigured } from '../integrations/supabase/client';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // 1. Live Supabase Auth if configured
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User not found in Supabase Auth');
      }

      // Fetch employee profile from public.employees table
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: empData?.full_name || (data.user.user_metadata as any)?.full_name || email.split('@')[0],
        role: (empData?.role || (data.user.user_metadata as any)?.role || 'employee') as 'admin' | 'employee',
        avatar_url: (data.user.user_metadata as any)?.avatar_url || ''
      };

      const token = data.session?.access_token || 'supabase_token';
      return { user, token };
    }

    // 2. Fallback to Local Backend API if Supabase is not configured
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Invalid email or password');
    }

    const resData = await res.json();
    return {
      user: resData.user,
      token: resData.access_token
    };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(console.warn);
    }
    localStorage.removeItem('billnexa_user');
    localStorage.removeItem('billnexa_token');
  },

  async getInitialUser(): Promise<{ user: User | null; token: string | null }> {
    if (isSupabaseConfigured() && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: empData } = await supabase
          .from('employees')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: empData?.full_name || (session.user.user_metadata as any)?.full_name || session.user.email?.split('@')[0] || 'User',
          role: (empData?.role || (session.user.user_metadata as any)?.role || 'employee') as 'admin' | 'employee',
          avatar_url: (session.user.user_metadata as any)?.avatar_url || ''
        };
        return { user, token: session.access_token };
      }
    }

    const savedUser = localStorage.getItem('billnexa_user');
    const savedToken = localStorage.getItem('billnexa_token');
    if (savedUser && savedToken) {
      try {
        return { user: JSON.parse(savedUser), token: savedToken };
      } catch {
        // invalid JSON
      }
    }
    return { user: null, token: null };
  }
};
