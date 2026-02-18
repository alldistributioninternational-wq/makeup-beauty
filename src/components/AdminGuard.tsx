// src/components/AdminGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Loader2, ShieldAlert, ShieldX } from 'lucide-react';
import Link from 'next/link';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, initAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await initAuth();
      setIsChecking(false);
    };
    checkAuth();
  }, [initAuth]);

  // Afficher un loader pendant la vérification
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur, afficher un message d'accès refusé
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Accès Restreint</h1>
          <p className="text-gray-600 mb-6">
            Cette section est réservée aux administrateurs. 
            Vous devez être connecté pour accéder à cette page.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/profile"
              className="block w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Se connecter
            </Link>
            
            <Link 
              href="/"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est admin
  if (!user.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-orange-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Accès Refusé</h1>
          <p className="text-gray-600 mb-2">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Cette section est réservée aux administrateurs uniquement.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/profile"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Mon profil
            </Link>
            
            <Link 
              href="/"
              className="block w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si utilisateur admin, afficher le contenu
  return <>{children}</>;
}