// src/app/(main)/personalise-profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Check, Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { mockLooks } from '@/data/mockLooks'

type UserProfile = {
  age: string
  favoriteBrands: string[]
  customBrand?: string
  makeupFrequency: string
  monthlyBudget: string
  skinType: string
}

const QUESTIONS = [
  {
    id: 'age',
    question: 'Quel âge avez-vous ?',
    type: 'buttons',
    options: [
      '18-24 ans',
      '25-34 ans',
      '35-44 ans',
      '45-54 ans',
      '55+ ans'
    ]
  },
  {
    id: 'favoriteBrands',
    question: 'Vos marques préférées ?',
    subtitle: 'Sélectionnez ou ajoutez vos marques',
    type: 'multi-select',
    options: [
      'MAC',
      'Maybelline',
      'L\'Oréal',
      'NARS',
      'Fenty Beauty',
      'NYX',
      'Estée Lauder',
      'Lancôme',
      'Urban Decay',
      'Clinique',
      'Sephora Collection',
      'Huda Beauty',
      'Charlotte Tilbury',
      'Too Faced',
      'Benefit'
    ]
  },
  {
    id: 'makeupFrequency',
    question: 'Fréquence de maquillage ?',
    type: 'buttons',
    options: [
      'Jamais',
      '1 fois/jour',
      '2 fois/jour',
      '3+ fois/jour',
      'Occasionnellement'
    ]
  },
  {
    id: 'monthlyBudget',
    question: 'Budget beauté mensuel ?',
    type: 'buttons',
    options: [
      'Moins de 20€',
      '20€ - 50€',
      '50€ - 100€',
      '100€ - 200€',
      'Plus de 200€'
    ]
  },
  {
    id: 'skinType',
    question: 'Votre type de peau ?',
    type: 'buttons',
    options: [
      'Normale',
      'Sèche',
      'Grasse',
      'Mixte',
      'Sensible'
    ]
  }
]

export default function PersonaliseProfilePage() {
  const router = useRouter()
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserProfile>>({})
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [customBrandInput, setCustomBrandInput] = useState('')
  const [customBrands, setCustomBrands] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendedLooks, setRecommendedLooks] = useState<any[]>([])

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setHasCompletedQuiz(true)
      const profile = JSON.parse(savedProfile)
      generateRecommendations(profile)
    }
  }, [])

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1

  const generateRecommendations = (profile: any) => {
    // Retourner uniquement les looks 1 et 2
    const looks = [mockLooks[0], mockLooks[1]]
    setRecommendedLooks(looks)
  }

  const handleAnswer = (answer: string) => {
    if (currentQuestion.id === 'favoriteBrands') {
      const newSelection = selectedBrands.includes(answer)
        ? selectedBrands.filter(b => b !== answer)
        : [...selectedBrands, answer]
      
      setSelectedBrands(newSelection)
      return
    }

    setIsAnimating(true)
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))

    setTimeout(() => {
      if (isLastQuestion) {
        completeQuiz(answer)
      } else {
        setCurrentQuestionIndex(prev => prev + 1)
        setIsAnimating(false)
      }
    }, 300)
  }

  const handleAddCustomBrand = () => {
    if (customBrandInput.trim() && !customBrands.includes(customBrandInput.trim())) {
      setCustomBrands([...customBrands, customBrandInput.trim()])
      setCustomBrandInput('')
    }
  }

  const handleRemoveCustomBrand = (brand: string) => {
    setCustomBrands(customBrands.filter(b => b !== brand))
  }

  const handleBrandsNext = () => {
    const totalBrands = selectedBrands.length + customBrands.length
    if (totalBrands === 0) {
      alert('Veuillez sélectionner au moins une marque')
      return
    }

    setIsAnimating(true)
    
    setAnswers(prev => ({
      ...prev,
      favoriteBrands: [...selectedBrands, ...customBrands]
    }))

    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  const completeQuiz = (lastAnswer: string) => {
    const finalProfile = {
      ...answers,
      [currentQuestion.id]: lastAnswer,
      favoriteBrands: [...selectedBrands, ...customBrands]
    }

    localStorage.setItem('userProfile', JSON.stringify(finalProfile))
    
    // Générer les recommandations et afficher immédiatement
    generateRecommendations(finalProfile)
    setIsQuizStarted(false)
    setShowResults(true)
    setHasCompletedQuiz(true)
  }

  const resetQuiz = () => {
    localStorage.removeItem('userProfile')
    setHasCompletedQuiz(false)
    setIsQuizStarted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSelectedBrands([])
    setCustomBrands([])
    setCustomBrandInput('')
    setShowResults(false)
  }

  // Écran d'accueil
  if (!isQuizStarted && !hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-xl w-full relative z-10">
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </Link>

            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full mb-6 animate-bounce">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                Ton Quiz Beauté
              </h1>
              <p className="text-xl text-white/90 mb-8">
                5 questions • 2 minutes • Looks personnalisés
              </p>
            </div>

            <button
              onClick={() => setIsQuizStarted(true)}
              className="group relative w-full py-6 px-8 bg-white text-gray-900 text-xl font-bold rounded-2xl hover:bg-pink-50 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Démarrer le quiz
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
          .animate-pulse {
            animation: pulse 4s ease-in-out infinite;
          }
          .delay-1000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    )
  }

  // Écran si déjà complété - Afficher les résultats
  if ((hasCompletedQuiz || showResults) && !isQuizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Accueil</span>
            </Link>
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors font-medium text-sm"
            >
              Refaire le quiz
            </button>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Tes Looks Personnalisés
            </h1>
            <p className="text-xl text-white/90">
              Basés sur tes préférences beauté
            </p>
          </div>
        </div>

        {/* Looks Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedLooks.map((look) => (
              <Link
                key={look.id}
                href={`/feed/${look.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-xl mb-2">{look.title}</h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {look.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4" />
                          {look.products.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                      {look.creator.name[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{look.creator.name}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {look.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-3">Plus de looks à découvrir</h2>
              <p className="mb-6 text-white/90">Explore tous les looks de notre communauté</p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-colors"
              >
                Voir tous les looks
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz en cours
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-500 ease-out shadow-lg shadow-white/50"
          style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Question counter */}
      <div className="absolute top-6 left-6 text-white/90 font-bold text-lg backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
        {currentQuestionIndex + 1} / {QUESTIONS.length}
      </div>

      {/* Main content */}
      <div className="w-full max-w-3xl relative z-10">
        <div 
          className={`transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}
        >
          {/* Question */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
              {currentQuestion.question}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Options pour sélection simple */}
          {currentQuestion.type === 'buttons' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full py-5 px-8 bg-white/95 backdrop-blur-xl hover:bg-white text-gray-800 text-lg md:text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border-4 border-transparent hover:border-pink-300 group"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <span className="group-hover:text-pink-600 transition-colors">{option}</span>
                </button>
              ))}
            </div>
          )}

          {/* Options pour sélection multiple (marques) */}
          {currentQuestion.type === 'multi-select' && (
            <div className="max-w-4xl mx-auto">
              {/* Input pour ajouter une marque personnalisée */}
              <div className="mb-6 bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  ✨ Ajouter une marque personnalisée
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customBrandInput}
                    onChange={(e) => setCustomBrandInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomBrand()}
                    placeholder="Ex: Rare Beauty, Milk Makeup..."
                    className="flex-1 py-3 px-4 bg-white text-gray-800 text-base rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomBrand}
                    disabled={!customBrandInput.trim()}
                    className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              {/* Marques personnalisées ajoutées */}
              {customBrands.length > 0 && (
                <div className="mb-6 flex gap-2 flex-wrap">
                  {customBrands.map((brand) => (
                    <div
                      key={brand}
                      className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg"
                    >
                      <span>{brand}</span>
                      <button
                        onClick={() => handleRemoveCustomBrand(brand)}
                        className="hover:bg-white/20 rounded-full p-1 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Grille des marques prédéfinies */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedBrands.includes(option)
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`py-4 px-4 text-base font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 border-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-pink-600 shadow-pink-500/50 scale-105'
                          : 'bg-white/95 backdrop-blur-xl hover:bg-white text-gray-800 border-transparent hover:border-pink-300'
                      }`}
                      style={{
                        animationDelay: `${index * 30}ms`
                      }}
                    >
                      {isSelected && <Check className="inline w-4 h-4 mr-1" />}
                      {option}
                    </button>
                  )
                })}
              </div>

              {/* Bouton suivant */}
              <button
                onClick={handleBrandsNext}
                disabled={selectedBrands.length === 0 && customBrands.length === 0}
                className={`w-full py-6 px-8 text-xl font-black rounded-2xl transition-all duration-300 shadow-2xl ${
                  selectedBrands.length === 0 && customBrands.length === 0
                    ? 'bg-white/30 text-white/50 cursor-not-allowed'
                    : 'bg-white text-pink-600 hover:bg-pink-50 hover:shadow-pink-500/50 transform hover:scale-105'
                }`}
              >
                Continuer ({selectedBrands.length + customBrands.length} sélectionné{selectedBrands.length + customBrands.length > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 30px) scale(1.1); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}