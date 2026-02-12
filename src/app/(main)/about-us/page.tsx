// src/app/(main)/about-us/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Heart, ShoppingBag, Users } from 'lucide-react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission')

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <Image
            src="/images/aboutus/aboutusimage.jpg"
            alt="About Ilma Skin"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <Link 
            href="/"
            className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </Link>

          {/*<h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            MAKEUP FOR PEOPLE WHO DON'T APOLOGIZE FOR THEIR HIGH STANDARDS
          </h1>*/}
         {/* <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg">
            Bienvenue chez Ilma Skin - Où la beauté rencontre l'audace
          </p>*/}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        
        {/* Notre Histoire */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Qui veut être peu exigeant de toute façon ? Et depuis quand posséder un seul baume à lèvres légèrement teinté est une bonne chose ? À quiconque a lancé cette tendance "sans chichi", avec tout le respect que nous vous devons, nous pleurerions pour vous mais notre mascara est trop cher.
                </p>
                <p>
                  C'est pourquoi nous serons audacieux et sans excuses en défendant l'esprit de toutes les personnes confiantes et prospères qui sont à parts égales style et substance. Le genre de personnes qui savent exactement ce qu'elles valent. Et exigent d'être traitées en conséquence.
                </p>
                <p className="font-semibold text-pink-600">
                  Chez Ilma Skin, nous croyons que le maquillage est une forme d'expression personnelle, pas une excuse.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/aboutus/aboutusimage.jpg"
                alt="Notre histoire"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-20">
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button
              onClick={() => setActiveTab('mission')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'mission'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notre Mission
            </button>
            <button
              onClick={() => setActiveTab('values')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'values'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nos Valeurs
            </button>
            <button
              onClick={() => setActiveTab('difference')}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === 'difference'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notre Différence
            </button>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-pink-200">
            {activeTab === 'mission' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Notre Mission
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Révolutionner la façon dont vous découvrez et achetez vos produits de beauté. Nous réunissons vos influenceurs préférés, leurs looks les plus tendance, des tutoriels détaillés et des produits faciles à acheter, le tout en un seul endroit.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Fini le temps perdu à parcourir les réseaux sociaux, regarder des dizaines de tutoriels et courir en magasin. Nous simplifions votre parcours beauté tout en maintenant les standards les plus élevés.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Nos Valeurs
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-pink-200">
                    <div className="text-3xl mb-3">💎</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Excellence</h4>
                    <p className="text-gray-700">
                      Nous ne faisons aucun compromis sur la qualité. Chaque produit, chaque look, chaque marque est soigneusement sélectionné.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
                    <div className="text-3xl mb-3">✨</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Authenticité</h4>
                    <p className="text-gray-700">
                      Nous croyons en l'expression personnelle authentique. Votre beauté, vos règles.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-pink-200">
                    <div className="text-3xl mb-3">🚀</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Innovation</h4>
                    <p className="text-gray-700">
                      Nous réinventons l'expérience shopping beauté avec une plateforme moderne et intuitive.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
                    <div className="text-3xl mb-3">💪</div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Empowerment</h4>
                    <p className="text-gray-700">
                      Nous donnons à chacun les outils pour exprimer sa confiance et son style unique.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'difference' && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Ce qui nous rend uniques
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-pink-200">
                    <Sparkles className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Looks Curatés par des Experts</h4>
                      <p className="text-gray-700">
                        Découvrez des looks créés par les meilleurs maquilleurs et influenceurs beauté, avec tous les produits nécessaires listés et prêts à acheter.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-purple-200">
                    <ShoppingBag className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Shopping Simplifié</h4>
                      <p className="text-gray-700">
                        Achetez tous les produits d'un look en un clic. Fini les recherches interminables et les comparaisons fastidieuses.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-pink-200">
                    <Users className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Communauté Passionnée</h4>
                      <p className="text-gray-700">
                        Rejoignez une communauté de passionnés de beauté qui partagent vos standards élevés et votre amour du maquillage.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white rounded-xl p-6 border border-purple-200">
                    <Heart className="w-8 h-8 text-purple-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Personnalisation Avancée</h4>
                      <p className="text-gray-700">
                        Grâce à notre système de profil personnalisé, recevez des recommandations adaptées à vos préférences, votre carnation et votre style.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Ilma Skin en chiffres
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-white/90">Looks disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-white/90">Marques partenaires</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
                <div className="text-white/90">Utilisateurs actifs</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
                <div className="text-white/90">Satisfaction client</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-black rounded-3xl p-8 md:p-16 text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à élever vos standards ?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez la communauté Ilma Skin et découvrez une nouvelle façon de shopper la beauté en ligne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Découvrir les looks
              </Link>
              <Link
                href="/personalise-profile"
                className="px-8 py-4 bg-pink-500 text-white text-lg font-bold rounded-full hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-white"
              >
                Personnaliser mon profil
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer spacing */}
      <div className="h-20"></div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}