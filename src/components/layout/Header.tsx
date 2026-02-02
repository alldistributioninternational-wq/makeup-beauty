'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  useEffect(() => {
    setCartItemCount(getTotalItems());
  }, [getTotalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Search size={24} />
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Ilma Skin
          </h1>

          <div className="flex items-center gap-4">
            <Link 
              href="/shop" 
              className="relative hover:opacity-80 transition-opacity"
              title="Boutique"
            >
              <Image
                src="/icons/shopping-bag.png"
                alt="Boutique"
                width={24}
                height={24}
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
                width={24}
                height={24}
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
          <div className="mt-4 animate-slideInDown">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des produits, looks, marques..."
                className="w-full px-4 py-3 pr-20 rounded-lg border-2 border-pink-200 focus:border-pink-500 focus:outline-none transition-colors"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  type="submit"
                  className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Search size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </form>

            {searchQuery && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <p className="text-sm text-gray-500">
                  Suggestions pour "{searchQuery}"...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}