// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { mockLooks } from '@/data/mockLooks';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [currentRow, setCurrentRow] = useState(1);
  
  const LOOKS_PER_ROW = 4;
  const totalRows = Math.ceil(mockLooks.length / LOOKS_PER_ROW);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentLooks = mockLooks.slice(
    (currentRow - 1) * LOOKS_PER_ROW,
    currentRow * LOOKS_PER_ROW
  );

  const showNext = () => {
    if (currentRow < totalRows) setCurrentRow(currentRow + 1);
  };

  const showPrevious = () => {
    if (currentRow > 1) setCurrentRow(currentRow - 1);
  };

  const skipToNext = () => {
    if (currentLookIndex < mockLooks.length - 1) {
      setCurrentLookIndex(currentLookIndex + 1);
    } else {
      setCurrentLookIndex(0);
    }
  };

  const currentLook = mockLooks[currentLookIndex];

  // VERSION MOBILE
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Titre et description avec plus d'espace après le header */}
        <div className="px-4 pt-6 pb-3 text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Trouve ton look parfait</h2>
          <p className="text-sm text-gray-600">
            Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
          </p>
        </div>

        {/* Filtres avec taille augmentée */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
          <button className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Naturel</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Glamour</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Soirée</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous les jours</button>
        </div>

        {/* Look cliquable - image seule */}
        <div className="flex-1 flex flex-col justify-center px-4 bg-white">
          <Link href={`/feed/${currentLook.id}`} className="relative w-full max-w-md mx-auto aspect-square rounded-t-2xl overflow-hidden block">
            <Image 
              src={currentLook.image} 
              alt={currentLook.title}
              fill
              className="object-cover"
              priority
            />
          </Link>

          {/* Box noire avec info et bouton SKIP - collé à l'image */}
          <div className="w-full max-w-md mx-auto bg-black rounded-b-2xl p-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                  {currentLook.creator.name[0]}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{currentLook.creator.name}</p>
                  <p className="text-xs text-gray-300">{currentLook.creator.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white text-sm">♡</span>
                <span className="text-xs font-medium text-white">{currentLook.likes.toLocaleString()}</span>
              </div>
            </div>

            {/* Bouton Skip à l'intérieur de la box noire */}
            <button 
              onClick={skipToNext}
              className="mx-auto block w-20 h-20 bg-pink-500 text-white rounded-full font-bold text-sm hover:bg-pink-600 transition-colors flex items-center justify-center shadow-lg"
            >
              SKIP
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VERSION DESKTOP
  return (
    <main className="max-w-7xl mx-auto px-6 py-3">
      <h2 className="text-3xl font-bold text-center mb-1">Trouve ton look parfait</h2>
      <p className="text-center text-gray-600 text-sm mb-2">
        Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
      </p>

      <div className="flex justify-center gap-2 mb-3">
        <button className="px-5 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium">Tous</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Naturel</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Glamour</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Soirée</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Tous les jours</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {currentLooks.map((look) => (
          <Link 
            key={look.id} 
            href={`/feed/${look.id}`}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow block"
          >
            <div className="relative aspect-[3/4]">
              <Image 
                src={look.image} 
                alt={look.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold">
                    {look.creator.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{look.creator.name}</p>
                    <p className="text-white/80 text-xs">{look.creator.username}</p>
                  </div>
                </div>
                <h3 className="text-white font-bold">{look.title}</h3>
                {currentRow > 1 && (
                  <>
                    <div className="flex gap-2 mt-1">
                      {look.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-white text-xs">
                      <span>♡ {look.likes}</span>
                      <span>🛍️ {look.products.length} produits</span>
                      <span className="bg-green-500/80 px-2 py-0.5 rounded capitalize">{look.difficulty}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-4 flex justify-center gap-3">
        {currentRow > 1 && (
          <button onClick={showPrevious} className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-gray-800 transition-colors">
            Voir moins de looks
          </button>
        )}
        {currentRow < totalRows && (
          <button onClick={showNext} className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-gray-800 transition-colors">
            Voir plus de looks
          </button>
        )}
      </div>
    </main>
  );
}