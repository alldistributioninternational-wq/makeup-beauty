// src/app/page.tsx
// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { mockLooks } from '@/data/mockLooks';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useSavedLooksStore } from '@/store/saved-looks.store';

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [currentRow, setCurrentRow] = useState(1);
  const [mounted, setMounted] = useState(false);
  
  // IMPORTANT : Récupère directement savedLookIds pour forcer le re-render
  const savedLookIds = useSavedLooksStore((state) => state.savedLookIds);
  const toggleLook = useSavedLooksStore((state) => state.toggleLook);
  
  const LOOKS_PER_ROW = 4;
  const totalRows = Math.ceil(mockLooks.length / LOOKS_PER_ROW);

  useEffect(() => {
    setMounted(true);
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

  // Bouton cœur EN HAUT (sur l'image) - Sauvegarde SEULEMENT, ne passe pas au suivant
  const handleToggleLike = (lookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLook(lookId);
  };

  // Bouton cœur EN BAS (dans la box noire) - Sauvegarde ET passe au suivant
  const handleMobileLikeAndNext = (lookId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLook(lookId); // Sauvegarde le look
    skipToNext(); // Passe au look suivant
  };

  const currentLook = mockLooks[currentLookIndex];
  // Vérifie directement avec savedLookIds au lieu de isLookSaved
  const isCurrentLookLiked = mounted && savedLookIds.includes(currentLook.id);

  // Looks pour les sections spéciales
  const trendingLooks = mockLooks.slice(0, 3); // Looks 1, 2, 3
  const lipLooks = mockLooks.slice(3, 5); // Looks 4, 5
  const eyeLooks = mockLooks.slice(5, 6); // Look 6

  // VERSION MOBILE - Style Tinder
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Titre et description */}
        <div className="px-4 pt-6 pb-3 text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Trouve ton look parfait</h2>
          <p className="text-sm text-gray-600">
            Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
          <button className="px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Naturel</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Glamour</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Soirée</button>
          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">Tous les jours</button>
        </div>

        {/* Look cliquable - image seule */}
        <div className="flex-1 flex flex-col justify-center px-4 bg-white">
          <div className="relative w-full max-w-md mx-auto">
            <Link href={`/feed/${currentLook.id}`} className="relative w-full aspect-square rounded-t-2xl overflow-hidden block">
              <Image 
                src={currentLook.image} 
                alt={currentLook.title}
                fill
                className="object-cover"
                priority
              />
            </Link>

            {/* Bouton Like en haut à droite de l'image - SEULEMENT sauvegarde */}
            {mounted && (
              <button
                onClick={(e) => handleToggleLike(currentLook.id, e)}
                className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart 
                  className={`w-6 h-6 transition-colors ${
                    isCurrentLookLiked 
                      ? 'fill-pink-500 text-pink-500' 
                      : 'text-gray-700'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Box noire avec info et 2 boutons - collé à l'image */}
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

            {/* 2 Boutons : Croix à gauche et Cœur à droite */}
            <div className="flex items-center justify-center gap-6">
              {/* Bouton Croix à gauche - Passe au look suivant SEULEMENT */}
              <button 
                onClick={skipToNext}
                className="w-20 h-20 bg-pink-500 text-white rounded-full font-bold text-4xl hover:bg-pink-600 transition-colors flex items-center justify-center shadow-lg"
              >
                ×
              </button>

              {/* Bouton Cœur à droite - Sauvegarde ET passe au look suivant */}
              <button 
                onClick={(e) => handleMobileLikeAndNext(currentLook.id, e)}
                className="w-20 h-20 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors flex items-center justify-center shadow-lg"
              >
                <Heart 
                  className={`w-10 h-10 transition-colors ${
                    isCurrentLookLiked 
                      ? 'fill-white text-white' 
                      : 'text-white'
                  }`}
                />
              </button>
            </div>
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

      <div className="grid grid-cols-4 gap-3 mb-8">
        {currentLooks.map((look) => {
          const isLiked = mounted && savedLookIds.includes(look.id);
          
          return (
            <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
              {mounted && (
                <button
                  onClick={(e) => handleToggleLike(look.id, e)}
                  className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`w-6 h-6 transition-colors ${
                      isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-700'
                    }`}
                  />
                </button>
              )}

              <Link href={`/feed/${look.id}`} className="block">
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
            </div>
          );
        })}
      </div>

      <div className="text-center mb-12 flex justify-center gap-3">
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

      {/* NOUVELLES SECTIONS EN BAS - DESKTOP */}
      <div className="py-12">
        {/* Titre principal */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-4">UNE NOUVELLE FAÇON DE SHOPPER LA BEAUTÉ EN LIGNE.</h1>
          <p className="text-base text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Parcourir des looks sur les réseaux sociaux, regarder des tutoriels et aller en magasin. 
            Qui a le temps pour tout ça ? Certainement pas vous, alors nous réunissons vos influenceurs préférés, 
            leurs looks les plus tendance et tutoriels et produits faciles à acheter, le tout en un seul endroit.
          </p>
        </div>

        {/* LOOKS TENDANCES */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-black mb-8">LOOKS TENDANCES</h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {trendingLooks.map((look) => {
              const isLiked = mounted && savedLookIds.includes(look.id);
              return (
                <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  {mounted && (
                    <button
                      onClick={(e) => handleToggleLike(look.id, e)}
                      className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-6 h-6 transition-colors ${
                          isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-700'
                        }`}
                      />
                    </button>
                  )}
                  <Link href={`/feed/${look.id}`} className="block">
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
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-lg text-gray-900 leading-relaxed font-medium">
            Découvrez les looks les plus populaires du moment. Ces créations inspirantes 
            ont conquis notre communauté et définissent les tendances beauté actuelles.
          </p>
        </div>

        {/* TOP LOOKS LÈVRES */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-black mb-8">TOP LOOKS LÈVRES</h2>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {lipLooks.map((look) => {
              const isLiked = mounted && savedLookIds.includes(look.id);
              return (
                <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  {mounted && (
                    <button
                      onClick={(e) => handleToggleLike(look.id, e)}
                      className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-6 h-6 transition-colors ${
                          isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-700'
                        }`}
                      />
                    </button>
                  )}
                  <Link href={`/feed/${look.id}`} className="block">
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
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-lg text-gray-900 leading-relaxed font-medium">
            Des lèvres parfaitement sublimées ! Explorez nos looks lèvres préférés, 
            du nude naturel au rouge statement en passant par les glossy lips tendance.
          </p>
        </div>

        {/* TOP LOOKS YEUX */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-black mb-8">TOP LOOKS YEUX</h2>
          <div className="grid grid-cols-3 gap-6">
            {eyeLooks.map((look) => {
              const isLiked = mounted && savedLookIds.includes(look.id);
              return (
                <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
                  {mounted && (
                    <button
                      onClick={(e) => handleToggleLike(look.id, e)}
                      className="absolute top-3 right-3 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-6 h-6 transition-colors ${
                          isLiked ? 'fill-pink-500 text-pink-500' : 'text-gray-700'
                        }`}
                      />
                    </button>
                  )}
                  <Link href={`/feed/${look.id}`} className="block">
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
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}