// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      register: async (email: string, password: string, fullName: string, phone?: string) => {
        set({ loading: true, error: null });
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (authError) {
            let errorMessage = 'Erreur lors de la création du compte';
            if (authError.message.includes('already registered')) errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
            else if (authError.message.includes('weak')) errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
            else if (authError.message.includes('invalid')) errorMessage = 'Format d\'email invalide';
            set({ loading: false, error: errorMessage });
            throw authError;
          }
          if (!authData.user) throw new Error('Erreur lors de la création du compte');

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email,
              full_name: fullName,
              phone: phone || null,
              is_admin: false,
            });

          if (profileError) throw profileError;

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          set({
            user: profile ? {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              is_admin: profile.is_admin || false,
            } : null,
            loading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || 'Erreur lors de la création du compte',
            loading: false,
          });
          throw err;
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            let errorMessage = 'Erreur lors de la connexion';
            if (authError.message.includes('Invalid login')) errorMessage = 'Email ou mot de passe incorrect.';
            else if (authError.message.includes('not found')) errorMessage = 'Aucun compte trouvé avec cet email.';
            else if (authError.message.includes('disabled')) errorMessage = 'Ce compte a été désactivé.';
            else if (authError.message.includes('too many')) errorMessage = 'Trop de tentatives. Réessayez plus tard.';
            else if (authError.message.includes('invalid email')) errorMessage = 'Format d\'email invalide';
            set({ loading: false, error: errorMessage });
            throw authError;
          }
          if (!authData.user) throw new Error('Erreur de connexion');

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) throw profileError;

          set({
            user: {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone,
              avatar_url: profile.avatar_url,
              is_admin: profile.is_admin || false,
            },
            loading: false,
          });
        } catch (err: any) {
          set({
            error: err.message || 'Email ou mot de passe incorrect',
            loading: false,
          });
          throw err;
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, loading: false });
        } catch (err: any) {
          set({
            error: err.message || 'Erreur lors de la déconnexion',
            loading: false,
          });
          throw err;
        }
      },

      // ✅ Ajout depuis Firebase store
      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),

      initAuth: async () => {
        set({ loading: true });
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              set({
                user: {
                  id: profile.id,
                  email: profile.email,
                  full_name: profile.full_name,
                  phone: profile.phone,
                  avatar_url: profile.avatar_url,
                  is_admin: profile.is_admin || false,
                },
                loading: false,
              });
              return;
            }
          }

          set({ user: null, loading: false });
        } catch (err) {
          console.error('Init auth error:', err);
          set({ user: null, loading: false });
        }
      },
    }),
    {
      // ✅ Ajout depuis Firebase store
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);