// src/app/(main)/saved-looks/page.tsx
// @ts-nocheck
"use client";

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockLooks } from '@/data/mockLooks';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react';
import { useSavedLooksStore } from '@/store/saved-looks.store';

function SavedLooksContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const savedLookIds = useSavedLooksStore((state) => state.savedLookIds);
  const toggleLook = useSavedLooksStore((state) => state.toggleLook);

  useEffect(() => {
    setMounted(true);
  }, []);

  const savedLooks = mockLooks.filter(look => savedLookIds.includes(look.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header avec style */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-3 bg-white hover:bg-gray-50 rounded-full transition-all shadow-md hover:shadow-lg">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
              <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Mes Coups de Cœur
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-gray-600 mt-1 ml-11">
              {savedLooks.length} look{savedLooks.length > 1 ? 's' : ''} sauvegardé{savedLooks.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {!mounted ? (
          <div className="text-center py-32">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
              <Heart className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Chargement de vos favoris...</p>
          </div>
        ) : savedLooks.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-pink-200 blur-3xl opacity-50 animate-pulse"></div>
              <Heart className="w-32 h-32 mx-auto text-pink-300 relative" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Aucun coup de cœur... encore !</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Commencez à aimer des looks pour les retrouver ici et créer votre collection personnelle
            </p>
            <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
              <Sparkles className="w-6 h-6" />
              Découvrir des looks
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedLooks.map((look, index) => (
              <div 
                key={look.id} 
                className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 group animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Badge "Favori" */}
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-white" />
                  Favori
                </div>

                {/* Bouton Unlike avec animation */}
                <button
                  onClick={() => toggleLook(look.id)}
                  className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-pink-50 transition-all hover:scale-110 group-hover:rotate-12"
                >
                  <Heart className="w-6 h-6 fill-pink-500 text-pink-500 animate-pulse" />
                </button>

                <Link href={`/feed/${look.id}`} className="block">
                  <div className="relative aspect-[3/4]">
                    <Image 
                      src={look.image} 
                      alt={look.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Overlay gradient coloré */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    
                    {/* Infos avec style */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform group-hover:translate-y-0 transition-transform">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white">
                          {look.creator.name[0]}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{look.creator.name}</p>
                          <p className="text-white/80 text-xs">{look.creator.username}</p>
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-base mb-2">{look.title}</h3>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-3 text-white/90 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-white" />
                          {look.likes.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {look.products.length} produits
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default function SavedLooksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
            <Heart className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-gray-600 mt-6 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    }>
      <SavedLooksContent />
    </Suspense>
  );
}