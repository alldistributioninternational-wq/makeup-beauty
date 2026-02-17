'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { User, Mail, Phone, LogOut, Loader2, CheckCircle, Package, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Toast inline pour éviter les problèmes de casing
function Toast({ message, type = 'error', onClose }: { message: string; type?: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white font-bold">×</button>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error, register, login, logout, clearError, initAuth } = useAuthStore();
  
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (error) {
      setShowErrorToast(true);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.email || !formData.password) return;
    if (!showLoginForm && !formData.fullName) return;

    try {
      if (showLoginForm) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.fullName, formData.phone);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
      
      setFormData({ email: '', password: '', fullName: '', phone: '' });
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCloseErrorToast = () => {
    setShowErrorToast(false);
    clearError();
  };

  // Vue non connectée
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        {showErrorToast && error && (
          <Toast message={error} type="error" onClose={handleCloseErrorToast} />
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showLoginForm ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-gray-600">
              {showLoginForm 
                ? 'Connectez-vous pour accéder à votre profil' 
                : 'Créez votre compte pour sauvegarder vos looks préférés'}
            </p>
          </div>

          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <p className="text-green-800 font-semibold">Votre profil a été bien créé !</p>
                <p className="text-green-600 text-sm">Bienvenue sur Ilma Skin 🎉</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!showLoginForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                    required={!showLoginForm}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {!showLoginForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-gray-400 text-xs">(optionnel)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors"
              />
              {!showLoginForm && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? 'Chargement...' : (showLoginForm ? 'Se connecter' : 'Créer mon compte')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {showLoginForm ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button
                onClick={() => {
                  setShowLoginForm(!showLoginForm);
                  clearError();
                  setShowErrorToast(false);
                  setFormData({ email: '', password: '', fullName: '', phone: '' });
                }}
                className="ml-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
              >
                {showLoginForm ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Pas besoin de compte pour commander
            </p>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Continuer sans compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vue connectée
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.full_name || 'Utilisateur'}</h1>
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 font-semibold"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Package className="text-pink-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Mes commandes</h2>
            </div>
            <p className="text-gray-600 mb-4">Suivez vos achats et leur livraison</p>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Aucune commande pour le moment</p>
              <button onClick={() => router.push('/shop')} className="mt-3 text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                Découvrir la boutique →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="text-purple-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Mes looks favoris</h2>
            </div>
            <p className="text-gray-600 mb-4">Retrouvez vos looks préférés sauvegardés</p>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Aucun look sauvegardé</p>
              <button onClick={() => router.push('/')} className="mt-3 text-purple-500 font-semibold hover:text-purple-600 transition-colors">
                Parcourir les looks →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="text-green-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Profil beauté</h2>
            </div>
            <p className="text-gray-600 mb-4">Personnalisez vos recommandations</p>
            <button onClick={() => router.push('/personalise-profile')} className="w-full bg-green-50 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-100 transition-colors">
              Compléter mon profil beauté
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="text-blue-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Informations du compte</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Nom complet</p>
                <p className="text-gray-900 font-medium">{user.full_name || 'Non renseigné'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                <p className="text-gray-900 font-medium">{user.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}