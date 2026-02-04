// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { mockLooks } from '@/data/mockLooks';
import Image from 'next/image';

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

  // VERSION MOBILE - Style comme Image 4
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Filtres responsives - Plus compacts */}
        <div className="flex gap-1.5 px-3 py-2.5 overflow-x-auto scrollbar-hide">
          <button className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Naturel</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Glamour</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Soirée</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous les jours</button>
        </div>

        {/* Look en carré centré - Comme Image 4 */}
        <div className="flex-1 flex items-center justify-center p-4 bg-white">
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden">
            <Image 
              src={currentLook.image} 
              alt={currentLook.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info en bas - Exactement comme Image 4 */}
        <div className="bg-white px-5 pb-6">
          {/* Nom du créateur et likes */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {currentLook.creator.name[0]}
              </div>
              <div>
                <p className="font-bold text-black text-base">{currentLook.creator.name}</p>
                <p className="text-sm text-gray-600">{currentLook.creator.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-900">♡</span>
              <span className="text-sm font-medium text-gray-900">{currentLook.likes.toLocaleString()}</span>
            </div>
          </div>

          {/* Titre du look */}
          <h2 className="font-bold text-xl text-black mb-2">{currentLook.title}</h2>
          
          {/* Tags */}
          <div className="flex gap-2 mb-4">
            {currentLook.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Bouton Skip - Rond comme Image 4 */}
          <button 
            onClick={skipToNext}
            className="mx-auto block w-32 h-32 bg-gray-900 text-white rounded-full font-bold text-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            SKIP
          </button>
        </div>
      </div>
    );
  }

  // VERSION DESKTOP - INCHANGÉE
  return (
    <main className="max-w-7xl mx-auto px-6 py-3">
      <h2 className="text-3xl font-bold text-center mb-1">Trouve ton look parfait</h2>
      <p className="text-center text-gray-600 text-sm mb-2">
        Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
      </p>

      <div className="flex justify-center gap-2 mb-3">
        <button className="px-5 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium">Tous</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Natural</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Glam</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Bold</button>
        <button className="px-5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Everyday</button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {currentLooks.map((look) => (
          <div key={look.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
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
          </div>
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