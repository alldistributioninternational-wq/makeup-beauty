'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Fichier : src/components/layout/Navigation/Header.tsx
export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setCartItemCount(getTotalItems());
  }, [getTotalItems]);

  // Charger la recherche depuis l'URL au chargement
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
      // Si la recherche est vide, retourner à la page d'accueil sans filtre
      router.push('/');
      setIsSearchOpen(false);
      return;
    }

    // Rediriger vers la page d'accueil avec le paramètre de recherche
    const searchUrl = `/?search=${encodeURIComponent(searchQuery.trim())}`;
    router.push(searchUrl);
    
    // Fermer la barre après un court délai pour permettre la navigation
    setTimeout(() => {
      setIsSearchOpen(false);
    }, 100);
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
    
    // Fermer la barre après un court délai
    setTimeout(() => {
      setIsSearchOpen(false);
    }, 100);
  };

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

          <Link href="/">
            <h1 className="text-xl font-bold text-gray-900 cursor-pointer hover:text-pink-600 transition-colors">
              Ilma Skin
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            {/* Lien vers les looks sauvegardés */}
            <Link 
              href="/saved-looks" 
              className="relative hover:opacity-80 transition-opacity"
              title="Mes looks favoris"
            >
              <Image
                src="/icons/heart.png"
                alt="Favoris"
                width={20}
                height={20}
              />
            </Link>

            {/* Lien vers le profil personnalisé */}
            <Link 
              href="/personalise-profile" 
              className="relative hover:opacity-80 transition-opacity"
              title="Personnaliser mon profil"
            >
              <Image
                src="/icons/genetic.png"
                alt="Profil génétique"
                width={20}
                height={20}
              />
            </Link>

            <Link 
              href="/shop" 
              className="relative hover:opacity-80 transition-opacity"
              title="Boutique"
            >
              <Image
                src="/icons/shopping-bag.png"
                alt="Boutique"
                width={20}
                height={20}
              />
            </Link>

            <Link 
              href="/cart" 
              className="relative hover:opacity-80 transition-opacity"
              title="Panier"
            >
              <Image
                src="/icons/basket.png"
                alt="Panier"
                width={20}
                height={20}
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartItemCount}
                </span>
              )}
            </Link>
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
                <button
                  type="submit"
                  className="p-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Search size={16} />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Effacer la recherche"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {searchQuery && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <p className="text-sm text-gray-600">
                  Appuyez sur Entrée pour rechercher "{searchQuery}"
                </p>
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