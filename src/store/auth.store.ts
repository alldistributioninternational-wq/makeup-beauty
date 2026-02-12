import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearError: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      loading: false,
      error: null,

      // Initialiser l'écoute de l'état d'auth Firebase
      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // Utilisateur connecté
            const userProfile: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              full_name: firebaseUser.displayName || undefined,
              avatar_url: firebaseUser.photoURL || undefined,
            };
            set({ user: userProfile, firebaseUser, loading: false });
          } else {
            // Utilisateur déconnecté
            set({ user: null, firebaseUser: null, loading: false });
          }
        });
      },

      // Inscription
      register: async (email: string, password: string, fullName: string, phone?: string) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Créer le profil
          const userProfile: UserProfile = {
            id: userCredential.user.uid,
            email: email,
            full_name: fullName,
            phone: phone,
          };

          // TODO: Sauvegarder dans Supabase plus tard
          // await createUserProfile(userProfile);

          set({ 
            user: userProfile,
            firebaseUser: userCredential.user,
            loading: false,
            error: null 
          });
        } catch (error: any) {
          console.error('Register error:', error);
          let errorMessage = 'Erreur lors de l\'inscription';
          
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'Cet email est déjà utilisé. Essayez de vous connecter.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Format d\'email invalide';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'L\'authentification par email n\'est pas activée. Contactez le support.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
              break;
          }
          
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Connexion
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          const userProfile: UserProfile = {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            full_name: userCredential.user.displayName || undefined,
            avatar_url: userCredential.user.photoURL || undefined,
          };

          set({ 
            user: userProfile,
            firebaseUser: userCredential.user,
            loading: false,
            error: null 
          });
        } catch (error: any) {
          console.error('Login error:', error);
          let errorMessage = 'Erreur lors de la connexion';
          
          switch (error.code) {
            case 'auth/invalid-credential':
              errorMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
              break;
            case 'auth/user-not-found':
              errorMessage = 'Aucun compte trouvé avec cet email. Créez un compte.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Mot de passe incorrect. Réessayez.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Format d\'email invalide';
              break;
            case 'auth/user-disabled':
              errorMessage = 'Ce compte a été désactivé. Contactez le support.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Trop de tentatives. Réessayez plus tard.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
              break;
          }
          
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Déconnexion
      logout: async () => {
        set({ loading: true, error: null });
        try {
          await signOut(auth);
          set({ user: null, firebaseUser: null, loading: false });
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ loading: false, error: 'Erreur lors de la déconnexion' });
          throw error;
        }
      },

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Sauvegarder seulement le user
    }
  )
);