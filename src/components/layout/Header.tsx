'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function HeaderContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // ✅ Nom du site depuis Supabase
  const [siteName, setSiteName] = useState('Ilma Skin');
  
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const { user, logout, initAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setCartItemCount(getTotalItems());
  }, [getTotalItems]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // ✅ Charger le nom du site depuis Supabase
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('site_name')
      .single()
      .then(({ data }) => {
        if (data?.site_name) setSiteName(data.site_name)
      })
  }, [])

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setIsSearchOpen(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push('/');
      setIsSearchOpen(false);
      return;
    }
    const searchUrl = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    router.push(searchUrl);
    setTimeout(() => { setIsSearchOpen(false); }, 100);
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/');
    setIsSearchOpen(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    const searchUrl = `/?search=${encodeURIComponent(suggestion)}`;
    router.push(searchUrl);
    setTimeout(() => { setIsSearchOpen(false); }, 100);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = () => setShowProfileMenu(false);
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileMenu]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Search size={20} />
          </button>

          {/* ✅ Nom du site dynamique */}
          <Link href="/">
            <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-pink-600 transition-colors">
              {siteName}
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/saved-looks" className="relative hover:opacity-80 transition-opacity" title="Mes looks favoris">
              <Image src="/icons/heart.png" alt="Favoris" width={20} height={20} />
            </Link>

            <Link href="/personalise-profile" className="relative hover:opacity-80 transition-opacity" title="Personnaliser mon profil">
              <Image src="/icons/genetic.png" alt="Profil génétique" width={20} height={20} />
            </Link>

            <Link href="/shop" className="relative hover:opacity-80 transition-opacity" title="Boutique">
              <Image src="/icons/shopping-bag.png" alt="Boutique" width={20} height={20} />
            </Link>

            <Link href="/cart" className="relative hover:opacity-80 transition-opacity" title="Panier">
              <Image src="/icons/basket.png" alt="Panier" width={20} height={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
                    className="relative hover:opacity-80 transition-opacity"
                    title="Mon profil"
                  >
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt="Mon profil" width={20} height={20} className="rounded-full" />
                    ) : (
                      <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.full_name || 'Utilisateur'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        Mon profil
                      </Link>
                      <Link href="/profile/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowProfileMenu(false)}>
                        Mes commandes
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <LogOut size={16} />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/profile" className="relative hover:opacity-80 transition-opacity" title="Se connecter">
                  <Image src="/icons/profil.png" alt="Se connecter" width={20} height={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-3 animate-slideInDown">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des looks (ex: soirée, naturel, glamour...)"
                className="w-full px-4 py-2 pr-20 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button type="submit" className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                  <Search size={16} />
                </button>
                {searchQuery && (
                  <button type="button" onClick={clearSearch} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors" title="Effacer la recherche">
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {searchQuery && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <p className="text-sm text-gray-600">Appuyez sur Entrée pour rechercher "{searchQuery}"</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500">Suggestions:</span>
                  {['soirée', 'naturel', 'glamour', 'tous les jours'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full hover:bg-pink-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10"></div>
            {/* ✅ Fallback aussi avec texte statique en attendant */}
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900">Ilma Skin</h1>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
}