'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Check, Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/cloudinary'
import { useAuthStore } from '@/store/auth.store'

interface Look {
  id: string
  title: string
  cloudinary_image_id: string | null
  creator_name?: string
  creator_username?: string
  likes?: number
  tags?: string[]
  is_featured?: boolean
  look_products?: {
    id: string
    products: {
      id: string
      brand: string
      name: string
    }
  }[]
}

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
    options: ['18-24 ans', '25-34 ans', '35-44 ans', '45-54 ans', '55+ ans']
  },
  {
    id: 'favoriteBrands',
    question: 'Vos marques préférées ?',
    subtitle: 'Sélectionnez ou ajoutez vos marques',
    type: 'multi-select',
    options: [
      'MAC', 'Maybelline', "L'Oréal", 'NARS', 'Fenty Beauty',
      'NYX', 'Estée Lauder', 'Lancôme', 'Urban Decay', 'Clinique',
      'Sephora Collection', 'Huda Beauty', 'Charlotte Tilbury', 'Too Faced', 'Benefit'
    ]
  },
  {
    id: 'makeupFrequency',
    question: 'Fréquence de maquillage ?',
    type: 'buttons',
    options: ['Jamais', '1 fois/jour', '2 fois/jour', '3+ fois/jour', 'Occasionnellement']
  },
  {
    id: 'monthlyBudget',
    question: 'Budget beauté mensuel ?',
    type: 'buttons',
    options: ['Moins de 20€', '20€ - 50€', '50€ - 100€', '100€ - 200€', 'Plus de 200€']
  },
  {
    id: 'skinType',
    question: 'Votre type de peau ?',
    type: 'buttons',
    options: ['Normale', 'Sèche', 'Grasse', 'Mixte', 'Sensible']
  }
]

// ─── Helpers tracking ────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('sessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem('sessionId', sessionId)
  }
  return sessionId
}

async function trackEvent(
  userId: string | null,
  eventType: 'view_look' | 'like_look' | 'add_to_cart' | 'purchase',
  meta: Record<string, any>
) {
  const sessionId = getOrCreateSessionId()
  const payload = {
    user_id: userId || null,
    session_id: sessionId,
    event_type: eventType,
    meta,
    created_at: new Date().toISOString(),
  }
  await supabase.from('user_events').insert(payload)
  const stored = JSON.parse(localStorage.getItem('userEvents') || '[]')
  stored.push(payload)
  localStorage.setItem('userEvents', JSON.stringify(stored.slice(-100)))
}

// ─── Algorithme : filtre strict puis score ────────────────────────────────────

function scoreAndSortLooks(looks: Look[], profile: any, events: any[]): Look[] {
  const interactedIds = new Set(events.map((e: any) => e.meta?.look_id).filter(Boolean))
  const favBrands: string[] = (profile.favoriteBrands || []).map((b: string) => b.toLowerCase())

  // ✅ ÉTAPE 1 : Filtre strict — only looks with at least 1 matching brand or tag
  const matchingLooks = looks.filter(look => {
    const productBrands: string[] = (look.look_products || [])
      .map((lp: any) => lp.products?.brand?.toLowerCase())
      .filter(Boolean)

    const tags = (look.tags || []).map(t => t.toLowerCase())

    const hasProductMatch = favBrands.some(brand =>
      productBrands.some(pb => pb.includes(brand) || brand.includes(pb))
    )
    const hasTagMatch = favBrands.some(brand =>
      tags.some(tag => tag.includes(brand) || brand.includes(tag))
    )

    return hasProductMatch || hasTagMatch
  })

  // ✅ ÉTAPE 2 : Fallback si aucun match → looks vedettes uniquement
  const looksToScore = matchingLooks.length > 0
    ? matchingLooks
    : looks.filter(l => l.is_featured)

  // ✅ ÉTAPE 3 : Scorer et trier
  const scored = looksToScore.map(look => {
    let score = 0
    if (look.is_featured) score += 2
    score += (look.likes || 0) * 0.01
    if (interactedIds.has(look.id)) score -= 10
    return { look, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.map(s => s.look)
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function PersonaliseProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserProfile>>({})
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [customBrandInput, setCustomBrandInput] = useState('')
  const [customBrands, setCustomBrands] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recommendedLooks, setRecommendedLooks] = useState<Look[]>([])
  const [allLooks, setAllLooks] = useState<Look[]>([])
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [userEvents, setUserEvents] = useState<any[]>([])

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1

  // ── Charger les looks AVEC produits et marques ────────────────────────────
  useEffect(() => {
    async function fetchLooks() {
      const { data, error } = await supabase
        .from('looks')
        .select(`
          *,
          look_products(
            id,
            products(id, brand, name)
          )
        `)
        .order('created_at', { ascending: false })

      if (!error && data) setAllLooks(data)
    }
    fetchLooks()
  }, [])

  // ── Charger les events passés ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchEvents() {
      let events: any[] = []
      if (user) {
        const { data } = await supabase
          .from('user_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200)
        events = data || []
      } else {
        events = JSON.parse(localStorage.getItem('userEvents') || '[]')
      }
      setUserEvents(events)
    }
    fetchEvents()
  }, [user])

  // ── Charger préférences existantes ────────────────────────────────────────
  useEffect(() => {
    if (allLooks.length === 0) return

    async function loadPreferences() {
      setLoadingPrefs(true)

      if (user) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data && !error) {
          const profile = {
            age: data.age,
            favoriteBrands: data.favorite_brands || [],
            makeupFrequency: data.makeup_frequency,
            monthlyBudget: data.monthly_budget,
            skinType: data.skin_type,
          }
          setHasCompletedQuiz(true)
          const sorted = scoreAndSortLooks(allLooks, profile, userEvents)
          setRecommendedLooks(sorted.slice(0, 6))
        }
      } else {
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          setHasCompletedQuiz(true)
          const sorted = scoreAndSortLooks(allLooks, JSON.parse(savedProfile), userEvents)
          setRecommendedLooks(sorted.slice(0, 6))
        }
      }

      setLoadingPrefs(false)
    }

    loadPreferences()
  }, [allLooks, user, userEvents])

  // ── Quiz handlers ─────────────────────────────────────────────────────────
  const handleAnswer = (answer: string) => {
    if (currentQuestion.id === 'favoriteBrands') {
      const newSelection = selectedBrands.includes(answer)
        ? selectedBrands.filter(b => b !== answer)
        : [...selectedBrands, answer]
      setSelectedBrands(newSelection)
      return
    }

    setIsAnimating(true)
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))

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
    if (selectedBrands.length === 0 && customBrands.length === 0) {
      alert('Veuillez sélectionner au moins une marque')
      return
    }
    setIsAnimating(true)
    setAnswers(prev => ({ ...prev, favoriteBrands: [...selectedBrands, ...customBrands] }))
    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1)
      setIsAnimating(false)
    }, 300)
  }

  // ── Sauvegarder et afficher les résultats ─────────────────────────────────
  const completeQuiz = async (lastAnswer: string) => {
    const finalProfile = {
      ...answers,
      [currentQuestion.id]: lastAnswer,
      favoriteBrands: [...selectedBrands, ...customBrands]
    }

    if (user) {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        age: finalProfile.age,
        favorite_brands: finalProfile.favoriteBrands,
        makeup_frequency: finalProfile.makeupFrequency,
        monthly_budget: finalProfile.monthlyBudget,
        skin_type: finalProfile.skinType,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      await trackEvent(user.id, 'view_look', { action: 'quiz_completed', brands: finalProfile.favoriteBrands })
    } else {
      localStorage.setItem('userProfile', JSON.stringify(finalProfile))
    }

    // ✅ Filtre strict + score avec le profil final directement
    const sorted = scoreAndSortLooks(allLooks, finalProfile, userEvents)
    setRecommendedLooks(sorted.slice(0, 6))

    setIsQuizStarted(false)
    setShowResults(true)
    setHasCompletedQuiz(true)
  }

  // ── Reset quiz ────────────────────────────────────────────────────────────
  const resetQuiz = async () => {
    if (user) {
      await supabase.from('user_preferences').delete().eq('user_id', user.id)
    } else {
      localStorage.removeItem('userProfile')
    }
    setHasCompletedQuiz(false)
    setIsQuizStarted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setSelectedBrands([])
    setCustomBrands([])
    setCustomBrandInput('')
    setShowResults(false)
    setRecommendedLooks([])
  }

  const handleLookClick = async (look: Look) => {
    await trackEvent(user?.id || null, 'view_look', {
      look_id: look.id,
      look_title: look.title,
      tags: look.tags,
    })
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingPrefs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  // ── Écran d'accueil ───────────────────────────────────────────────────────
  if (!isQuizStarted && !hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />

        <div className="max-w-xl w-full relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour</span>
          </Link>

          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full mb-6 animate-bounce">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">Ton Quiz Beauté</h1>
          <p className="text-xl text-white/90 mb-2">5 questions • 2 minutes • Looks personnalisés</p>
          {user ? (
            <p className="text-white/70 text-sm mb-8">
              Connectée en tant que <span className="font-semibold">{user.full_name || user.email}</span> — tes préférences seront sauvegardées
            </p>
          ) : (
            <p className="text-white/70 text-sm mb-8">
              Connecte-toi pour sauvegarder tes préférences sur tous tes appareils
            </p>
          )}

          <button
            onClick={() => setIsQuizStarted(true)}
            className="group relative w-full py-6 px-8 bg-white text-gray-900 text-xl font-bold rounded-2xl hover:bg-pink-50 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Démarrer le quiz
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
        </div>
      </div>
    )
  }

  // ── Résultats ─────────────────────────────────────────────────────────────
  if ((hasCompletedQuiz || showResults) && !isQuizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Accueil</span>
            </Link>
            <button onClick={resetQuiz} className="px-4 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors font-medium text-sm">
              Refaire le quiz
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Tes Looks Personnalisés</h1>
            <p className="text-xl text-white/90">
              {recommendedLooks.length > 0
                ? `${recommendedLooks.length} look${recommendedLooks.length > 1 ? 's' : ''} sélectionné${recommendedLooks.length > 1 ? 's' : ''} pour toi`
                : 'Basés sur tes préférences beauté'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {recommendedLooks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Aucun look trouvé avec tes marques favorites.</p>
              <p className="text-sm text-gray-400 mb-6">Essaie d'ajouter d'autres marques ou explore tous les looks.</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetQuiz} className="px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors">
                  Refaire le quiz
                </button>
                <Link href="/" className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Voir tous les looks
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedLooks.map((look) => {
                  const lookBrands = [...new Set(
                    (look.look_products || [])
                      .map((lp: any) => lp.products?.brand)
                      .filter(Boolean)
                  )] as string[]

                  return (
                    <Link
                      key={look.id}
                      href={`/feed/${look.id}`}
                      onClick={() => handleLookClick(look)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={getCloudinaryUrl(look.cloudinary_image_id)}
                          alt={look.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {look.is_featured && (
                          <div className="absolute top-3 left-3 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                            ⭐ Vedette
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-white font-bold text-xl mb-2">{look.title}</h3>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {look.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-4 h-4" />
                                {look.look_products?.length || 0} produits
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                            {look.creator_name?.[0] || 'U'}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{look.creator_name || 'User'}</span>
                        </div>
                        {/* Marques des produits du look */}
                        {lookBrands.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-2">
                            {lookBrands.slice(0, 3).map((brand: string) => (
                              <span key={brand} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                {brand}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {look.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}

          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-3">Plus de looks à découvrir</h2>
              <p className="mb-6 text-white/90">Explore tous les looks de notre communauté</p>
              <Link href="/" className="inline-block px-8 py-3 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-colors">
                Voir tous les looks
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz en cours ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-2 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-500 ease-out shadow-lg shadow-white/50"
          style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className="absolute top-6 left-6 text-white/90 font-bold text-lg backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
        {currentQuestionIndex + 1} / {QUESTIONS.length}
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
              {currentQuestion.question}
            </h2>
            {currentQuestion.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg">{currentQuestion.subtitle}</p>
            )}
          </div>

          {currentQuestion.type === 'buttons' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="w-full py-5 px-8 bg-white/95 backdrop-blur-xl hover:bg-white text-gray-800 text-lg md:text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border-4 border-transparent hover:border-pink-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="group-hover:text-pink-600 transition-colors">{option}</span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multi-select' && (
            <div className="max-w-4xl mx-auto">
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

              {customBrands.length > 0 && (
                <div className="mb-6 flex gap-2 flex-wrap">
                  {customBrands.map((brand) => (
                    <div key={brand} className="flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full shadow-lg">
                      <span>{brand}</span>
                      <button onClick={() => handleRemoveCustomBrand(brand)} className="hover:bg-white/20 rounded-full p-1 transition-colors">×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedBrands.includes(option)
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`py-4 px-4 text-base font-bold rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 ${
                        isSelected
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                          : 'bg-white/95 backdrop-blur-xl hover:bg-white text-gray-800'
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {isSelected && <Check className="inline w-4 h-4 mr-1" />}
                      {option}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleBrandsNext}
                disabled={selectedBrands.length === 0 && customBrands.length === 0}
                className={`w-full py-6 px-8 text-xl font-black rounded-2xl transition-all duration-300 shadow-2xl ${
                  selectedBrands.length === 0 && customBrands.length === 0
                    ? 'bg-white/30 text-white/50 cursor-not-allowed'
                    : 'bg-white text-pink-600 hover:bg-pink-50 transform hover:scale-105'
                }`}
              >
                Continuer ({selectedBrands.length + customBrands.length} sélectionné{selectedBrands.length + customBrands.length > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}