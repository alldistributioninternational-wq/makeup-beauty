// src/app/page.tsx
// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockLooks } from '@/data/mockLooks';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useSavedLooksStore } from '@/store/saved-looks.store';
import NewsletterSection from '@/components/layout/NewsletterSection';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [isMobile, setIsMobile] = useState(false);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [currentRow, setCurrentRow] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [viewedLooks, setViewedLooks] = useState<string[]>([]);
  const [showExhaustedMessage, setShowExhaustedMessage] = useState(false);
  
  // IMPORTANT : Récupère directement savedLookIds pour forcer le re-render
  const savedLookIds = useSavedLooksStore((state) => state.savedLookIds);
  const toggleLook = useSavedLooksStore((state) => state.toggleLook);
  
  const LOOKS_PER_ROW = 4;

  // Fonction pour normaliser les chaînes (enlever les accents)
  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrer les looks selon le filtre sélectionné OU la recherche
  const getFilteredLooks = () => {
    let looks = mockLooks;

    // Si recherche active, filtrer par recherche
    if (searchQuery) {
      const query = normalizeString(searchQuery);
      looks = mockLooks.filter(look => 
        normalizeString(look.title).includes(query) ||
        look.tags.some(tag => normalizeString(tag).includes(query)) ||
        normalizeString(look.creator.name).includes(query) ||
        (look.category && normalizeString(look.category).includes(query))
      );
      return looks;
    }

    // Sinon utiliser les filtres prédéfinis
    switch(selectedFilter) {
      case 'Naturel':
        return mockLooks.filter(look => 
          look.category === 'naturel' || 
          look.tags.some(tag => normalizeString(tag) === 'naturel' || normalizeString(tag) === 'natural')
        );
      case 'Glamour':
        return mockLooks.filter(look => 
          look.category === 'glamour' || 
          look.tags.some(tag => normalizeString(tag) === 'glamour' || normalizeString(tag) === 'glam')
        );
      case 'Soirée':
        return mockLooks.filter(look => 
          look.category === 'soirée' || 
          look.tags.some(tag => normalizeString(tag) === 'soiree' || normalizeString(tag) === 'evening')
        );
      case 'Tous les jours':
        return mockLooks.filter(look => 
          look.category === 'tous-les-jours' || 
          look.tags.some(tag => 
            normalizeString(tag) === 'quotidien' || 
            normalizeString(tag) === 'tous les jours' ||
            normalizeString(tag) === 'everyday' ||
            normalizeString(tag) === 'casual'
          )
        );
      default:
        return mockLooks; // Tous
    }
  };

  const filteredLooks = getFilteredLooks();
  const totalRows = Math.ceil(filteredLooks.length / LOOKS_PER_ROW);

  // Gérer les looks non vus en mode Tinder
  const getUnviewedLooks = () => {
    return filteredLooks.filter(look => !viewedLooks.includes(look.id));
  };

  const unviewedLooks = getUnviewedLooks();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Réinitialiser l'index quand le filtre change
  useEffect(() => {
    setCurrentLookIndex(0);
    setCurrentRow(1);
    setViewedLooks([]);
    setShowExhaustedMessage(false);
  }, [selectedFilter]);

  // Réinitialiser l'index quand la recherche change
  useEffect(() => {
    setCurrentLookIndex(0);
    setCurrentRow(1);
    setViewedLooks([]);
    setShowExhaustedMessage(false);
  }, [searchQuery]);

  const currentLooks = filteredLooks.slice(
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
    if (isMobile) {
      // Marquer le look actuel comme vu
      const currentLookId = filteredLooks[currentLookIndex]?.id;
      if (currentLookId && !viewedLooks.includes(currentLookId)) {
        setViewedLooks([...viewedLooks, currentLookId]);
      }

      // Vérifier s'il reste des looks non vus
      const remainingUnviewed = filteredLooks.filter(
        (look, idx) => idx > currentLookIndex && !viewedLooks.includes(look.id)
      );

      if (remainingUnviewed.length === 0) {
        // Tous les looks ont été vus
        setShowExhaustedMessage(true);
      } else {
        // Passer au prochain look non vu
        const nextIndex = currentLookIndex + 1;
        if (nextIndex < filteredLooks.length) {
          setCurrentLookIndex(nextIndex);
        }
      }
    } else {
      if (currentLookIndex < filteredLooks.length - 1) {
        setCurrentLookIndex(currentLookIndex + 1);
      } else {
        setCurrentLookIndex(0);
      }
    }
  };

  const resetViewedLooks = () => {
    setViewedLooks([]);
    setCurrentLookIndex(0);
    setShowExhaustedMessage(false);
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

  const currentLook = filteredLooks[currentLookIndex];
  // Vérifie directement avec savedLookIds au lieu de isLookSaved
  const isCurrentLookLiked = mounted && currentLook && savedLookIds.includes(currentLook.id);

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

        {/* Filtres fonctionnels */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setSelectedFilter('Tous')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              selectedFilter === 'Tous' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous
          </button>
          <button 
            onClick={() => setSelectedFilter('Naturel')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              selectedFilter === 'Naturel' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Naturel
          </button>
          <button 
            onClick={() => setSelectedFilter('Glamour')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              selectedFilter === 'Glamour' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Glamour
          </button>
          <button 
            onClick={() => setSelectedFilter('Soirée')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              selectedFilter === 'Soirée' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Soirée
          </button>
          <button 
            onClick={() => setSelectedFilter('Tous les jours')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
              selectedFilter === 'Tous les jours' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous les jours
          </button>
        </div>

        {/* Message de recherche active */}
        {searchQuery && (
          <div className="mx-4 mt-2 mb-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-lg">
            <p className="text-sm text-pink-800">
              🔍 Résultats pour "<span className="font-semibold">{searchQuery}</span>" • {filteredLooks.length} look{filteredLooks.length > 1 ? 's' : ''} trouvé{filteredLooks.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Look cliquable - image seule - RÉDUIT DE 15% */}
        {!showExhaustedMessage && currentLook ? (
          <div className="flex flex-col justify-center px-4 bg-white py-2">
            <div className="relative w-full max-w-md mx-auto" style={{ maxHeight: '72vh' }}>
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
            <div className="w-full max-w-md mx-auto bg-black rounded-b-2xl p-3 pb-4">
              <div className="flex items-center justify-between mb-3">
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

                {/* Bouton Cœur à droite - Sauvegarde ET passe au suivant */}
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
        ) : showExhaustedMessage ? (
          // Message d'épuisement des looks
          <div className="flex flex-col justify-center items-center px-4 py-12">
            <div className="w-full max-w-md mx-auto bg-black rounded-2xl p-8 text-center">
              <div className="mb-6">
                <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  Vous avez épuisé tous les looks !
                </h3>
                <p className="text-gray-300 text-sm">
                  Vous avez vu tous les looks disponibles dans cette catégorie.
                </p>
              </div>
              <button
                onClick={resetViewedLooks}
                className="w-full py-4 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-colors"
              >
                Revoir les looks
              </button>
            </div>
          </div>
        ) : null}

        {/* Espace vide après le Tinder-like form */}
        <div className="h-12"></div>

        {/* SECTIONS EN BAS - MOBILE */}
        <div className="px-4 py-8">
          {/* Titre principal */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-3">UNE NOUVELLE FAÇON DE SHOPPER LA BEAUTÉ EN LIGNE.</h1>
            <p className="text-sm text-gray-700 leading-relaxed">
              Parcourir des looks sur les réseaux sociaux, regarder des tutoriels et aller en magasin. 
              Qui a le temps pour tout ça ? Certainement pas vous, alors nous réunissons vos influenceurs préférés, 
              leurs looks les plus tendance et tutoriels et produits faciles à acheter, le tout en un seul endroit.
            </p>
          </div>

          {/* LOOKS TENDANCES */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">LOOKS TENDANCES</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {trendingLooks.map((look) => {
                const isLiked = mounted && savedLookIds.includes(look.id);
                return (
                  <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
                    {mounted && (
                      <button
                        onClick={(e) => handleToggleLike(look.id, e)}
                        className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
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
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="text-base text-gray-900 leading-relaxed font-medium">
              Découvrez les looks les plus populaires du moment. Ces créations inspirantes 
              ont conquis notre communauté et définissent les tendances beauté actuelles.
            </p>
          </div>

          {/* TOP LOOKS LÈVRES */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">TOP LOOKS LÈVRES</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {lipLooks.map((look) => {
                const isLiked = mounted && savedLookIds.includes(look.id);
                return (
                  <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
                    {mounted && (
                      <button
                        onClick={(e) => handleToggleLike(look.id, e)}
                        className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
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
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="text-base text-gray-900 leading-relaxed font-medium">
              Des lèvres parfaitement sublimées ! Explorez nos looks lèvres préférés, 
              du nude naturel au rouge statement en passant par les glossy lips tendance.
            </p>
          </div>

          {/* TOP LOOKS YEUX */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-black mb-6">TOP LOOKS YEUX</h2>
            <div className="grid grid-cols-2 gap-3">
              {eyeLooks.map((look) => {
                const isLiked = mounted && savedLookIds.includes(look.id);
                return (
                  <div key={look.id} className="relative bg-white rounded-2xl overflow-hidden shadow-sm">
                    {mounted && (
                      <button
                        onClick={(e) => handleToggleLike(look.id, e)}
                        className="absolute top-2 right-2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors ${
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
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION HERO - MOBILE - À LA FIN */}
          <div className="w-full -mx-4 bg-black py-12 px-6 mt-12">
            <div className="flex flex-col">
              {/* Texte en haut */}
              <div className="text-white mb-8">
                <h2 className="text-3xl font-bold mb-6 leading-tight">
                  MAQUILLAGE POUR LES GENS QUI NE S'EXCUSENT PAS POUR LEURS STANDARDS ÉLEVÉS.
                </h2>
                <p className="text-sm mb-6 leading-relaxed">
                  Qui veut être peu exigeant de toute façon ? Et depuis quand posséder un seul baume à lèvres légèrement teinté est une bonne chose ? À quiconque a lancé cette tendance "sans chichi", avec tout le respect que nous vous devons, nous pleurerions pour vous mais notre mascara est trop cher. C'est pourquoi nous serons audacieux et sans excuses en défendant l'esprit de toutes les personnes confiantes et prospères qui sont à parts égales style et substance. Le genre de personnes qui savent exactement ce qu'elles valent. Et exigent d'être traitées en conséquence.
                </p>
                <Link 
                  href="/about-us"
                  className="inline-block px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors text-sm"
                >
                  DÉCOUVREZ-NOUS
                </Link>
              </div>
              
              {/* Image en bas */}
              <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src="/images/aboutus/aboutusimage.jpg"
                  alt="Makeup hero"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <NewsletterSection />

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // VERSION DESKTOP
  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-3">
        <h2 className="text-3xl font-bold text-center mb-1">Trouve ton look parfait</h2>
        <p className="text-center text-gray-600 text-sm mb-2">
          Inspire-toi des looks de notre communauté et achète directement les produits utilisés.
        </p>

        {/* Filtres fonctionnels - Desktop */}
        <div className="flex justify-center gap-2 mb-3">
          <button 
            onClick={() => setSelectedFilter('Tous')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === 'Tous' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous
          </button>
          <button 
            onClick={() => setSelectedFilter('Naturel')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === 'Naturel' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Naturel
          </button>
          <button 
            onClick={() => setSelectedFilter('Glamour')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === 'Glamour' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Glamour
          </button>
          <button 
            onClick={() => setSelectedFilter('Soirée')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === 'Soirée' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Soirée
          </button>
          <button 
            onClick={() => setSelectedFilter('Tous les jours')}
            className={`px-5 py-1.5 rounded-full text-xs font-medium ${
              selectedFilter === 'Tous les jours' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Tous les jours
          </button>
        </div>

        {/* Message de recherche active - Desktop */}
        {searchQuery && (
          <div className="max-w-2xl mx-auto mt-4 mb-4 px-6 py-3 bg-pink-50 border border-pink-200 rounded-xl text-center">
            <p className="text-base text-pink-800">
              🔍 Résultats pour "<span className="font-semibold">{searchQuery}</span>" • {filteredLooks.length} look{filteredLooks.length > 1 ? 's' : ''} trouvé{filteredLooks.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

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

          {/* SECTION HERO - DESKTOP - À LA FIN */}
          <div className="w-full bg-pink-500 py-16 px-8 rounded-2xl">
            <div className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center">
              {/* Image à gauche */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src="/images/aboutus/aboutusimage.jpg"
                  alt="Makeup hero"
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Texte à droite */}
              <div className="text-white">
                <h2 className="text-5xl font-bold mb-6 leading-tight">
                  MAQUILLAGE POUR LES GENS QUI NE S'EXCUSENT PAS POUR LEURS STANDARDS ÉLEVÉS.
                </h2>
                <p className="text-lg mb-8 leading-relaxed">
                  Qui veut être peu exigeant de toute façon ? Et depuis quand posséder un seul baume à lèvres légèrement teinté est une bonne chose ? À quiconque a lancé cette tendance "sans chichi", avec tout le respect que nous vous devons, nous pleurerions pour vous mais notre mascara est trop cher. C'est pourquoi nous serons audacieux et sans excuses en défendant l'esprit de toutes les personnes confiantes et prospères qui sont à parts égales style et substance. Le genre de personnes qui savent exactement ce qu'elles valent. Et exigent d'être traitées en conséquence.
                </p>
                <Link 
                  href="/about-us"
                  className="inline-block px-8 py-3 border-2 border-white text-white font-medium hover:bg-white hover:text-pink-500 transition-colors text-lg"
                >
                  DÉCOUVREZ-NOUS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </>
  );
}