// /src/app/(main)/checkout-look/[lookId]/page.tsx

'use client'

import { use, useEffect, Suspense } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getLookById } from '@/data/mockLooks'
import { getProductById } from '@/data/mockProducts'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart.store'

function CheckoutLookContent({ lookId }: { lookId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const look = getLookById(lookId)
  const addItem = useCartStore((state: any) => state?.addItem)

  // État pour la carnation sélectionnée
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null)
  const [showSkinToneModal, setShowSkinToneModal] = useState(false)

  if (!look) {
    notFound()
  }

  // Récupérer les produits sélectionnés depuis l'URL
  const selectedParam = searchParams.get('selected')
  const isAllProducts = !selectedParam

  // Initialiser les produits cochés
  const getInitialCheckedProducts = () => {
    const checked = new Set<string>()
    
    if (isAllProducts) {
      // Si "all", tous les produits sont cochés par défaut
      look.products.forEach(item => {
        const key = item.shadeId ? `${item.productId}-${item.shadeId}` : item.productId
        checked.add(key)
      })
    } else if (selectedParam) {
      // Si produits sélectionnés, seuls ceux-là sont cochés
      selectedParam.split(',').forEach(item => checked.add(item))
    }
    
    return checked
  }

  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(getInitialCheckedProducts())

  // Charger la carnation sauvegardée au montage
  useEffect(() => {
    const savedSkinTone = localStorage.getItem('userSkinTone')
    if (savedSkinTone) {
      setSelectedSkinTone(savedSkinTone)
    }
  }, [])

  // Palette de carnations (20 teintes)
  const skinTones = [
    { id: '1', name: 'Très clair rosé', hex: '#FFE4D6' },
    { id: '2', name: 'Clair rosé', hex: '#FFDCC5' },
    { id: '3', name: 'Clair neutre', hex: '#FFD4B3' },
    { id: '4', name: 'Clair chaud', hex: '#FFCBA4' },
    { id: '5', name: 'Moyen clair rosé', hex: '#F5C6A5' },
    { id: '6', name: 'Moyen clair neutre', hex: '#EAB896' },
    { id: '7', name: 'Moyen clair chaud', hex: '#E0AC7E' },
    { id: '8', name: 'Moyen neutre', hex: '#D4A276' },
    { id: '9', name: 'Moyen chaud', hex: '#C99869' },
    { id: '10', name: 'Moyen doré', hex: '#BE8E5C' },
    { id: '11', name: 'Moyen foncé neutre', hex: '#B1824F' },
    { id: '12', name: 'Moyen foncé chaud', hex: '#A47444' },
    { id: '13', name: 'Foncé neutre', hex: '#8B6341' },
    { id: '14', name: 'Foncé chaud', hex: '#7A5638' },
    { id: '15', name: 'Très foncé neutre', hex: '#6B4A31' },
    { id: '16', name: 'Très foncé chaud', hex: '#5D3F2A' },
    { id: '17', name: 'Profond neutre', hex: '#4E3423' },
    { id: '18', name: 'Profond chaud', hex: '#43291E' },
    { id: '19', name: 'Très profond', hex: '#3A1F19' },
    { id: '20', name: 'Ultra profond', hex: '#2C1614' },
  ]

  const toggleProductCheck = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    const newChecked = new Set(checkedProducts)
    
    if (newChecked.has(key)) {
      newChecked.delete(key)
    } else {
      newChecked.add(key)
    }
    
    setCheckedProducts(newChecked)
  }

  const isProductChecked = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    return checkedProducts.has(key)
  }

  // Vérifier s'il y a des produits de teint/peau sélectionnés
  const hasSkinProducts = () => {
    return look.products.some(item => {
      const isChecked = isProductChecked(item.productId, item.shadeId)
      const isSkinProduct = ['Teint', 'Correcteur', 'Poudre'].includes(item.category)
      return isChecked && isSkinProduct
    })
  }

  // Calculer le total
  const calculateTotal = () => {
    let total = 0
    look.products.forEach(item => {
      if (isProductChecked(item.productId, item.shadeId)) {
        const product = getProductById(item.productId)
        if (product) {
          total += product.price
        }
      }
    })
    return total.toFixed(2)
  }

  const handleSkinToneSelect = (toneId: string) => {
    setSelectedSkinTone(toneId)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('userSkinTone', toneId)
    
    // Fermer la modal
    setShowSkinToneModal(false)
  }

  const addToCart = (skinTone?: string) => {
    // Ajouter tous les produits cochés au panier
    look.products.forEach(item => {
      if (isProductChecked(item.productId, item.shadeId)) {
        const product = getProductById(item.productId)
        if (product && addItem) {
          const shade = product.shades?.find(s => s.id === item.shadeId)
          
          addItem({
            productId: product.id,
            shadeId: item.shadeId || '',
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            shade: shade?.name || '',
            quantity: 1,
            skinTone: skinTone || selectedSkinTone || undefined
          })
        }
      }
    })
    
    // Rediriger vers le panier
    router.push('/cart')
  }

  const handleValidate = () => {
    // Vérifier si carnation nécessaire et non sélectionnée
    if (hasSkinProducts() && !selectedSkinTone) {
      // Ouvrir la modal de sélection de carnation
      setShowSkinToneModal(true)
      return
    }

    // Si carnation déjà sélectionnée ou pas de produits peau, ajouter directement
    addToCart()
  }

  // Organiser les produits par catégorie
  const categorizedProducts = {
    peau: look.products.filter(p => ['Teint', 'Correcteur', 'Poudre', 'Blush', 'Highlighter'].includes(p.category)),
    cils: look.products.filter(p => p.category === 'Mascara'),
    yeux: look.products.filter(p => ['Fard à paupières', 'Eye-liner', 'Sourcils'].includes(p.category)),
    lèvres: look.products.filter(p => ['Rouge à lèvres', 'Gloss'].includes(p.category))
  }

  const renderProductsByCategory = (categoryProducts: typeof look.products, categoryTitle: string) => {
    if (categoryProducts.length === 0) return null

    const isSkinCategory = categoryTitle === 'Peau'

    return (
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">
          {categoryTitle}
        </h3>

        {/* Section carnation - affichée en haut de la catégorie Peau si des produits de peau sont cochés */}
        {isSkinCategory && hasSkinProducts() && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-2 border-pink-200">
            {selectedSkinTone ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full border-3 border-white shadow-md" 
                    style={{ backgroundColor: skinTones.find(t => t.id === selectedSkinTone)?.hex }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Votre carnation de peau</p>
                    <p className="text-base font-bold text-gray-900">
                      {skinTones.find(t => t.id === selectedSkinTone)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSkinToneModal(true)}
                  className="px-4 py-2 bg-white hover:bg-pink-50 text-pink-600 font-semibold rounded-lg border-2 border-pink-300 transition-colors flex items-center gap-2 text-sm"
                >
                  ✏️ Modifier
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  🎨 Sélectionnez votre carnation de peau
                </p>
                <button
                  onClick={() => setShowSkinToneModal(true)}
                  className="w-full px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Choisir ma carnation
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {categoryProducts.map((item) => {
            const product = getProductById(item.productId)
            if (!product) return null

            const isChecked = isProductChecked(product.id, item.shadeId)

            return (
              <div key={`${item.productId}-${item.shadeId}`} className="flex gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleProductCheck(product.id, item.shadeId)}
                    className="h-5 w-5 rounded border-gray-300 cursor-pointer accent-pink-500"
                  />
                </div>
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  
                  {/* Afficher la carnation pour les produits de peau */}
                  {selectedSkinTone && ['Teint', 'Correcteur', 'Poudre'].includes(item.category) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowSkinToneModal(true)
                      }}
                      className="mt-2 flex items-center gap-2 w-fit group hover:bg-pink-50 px-2 py-1 rounded-lg transition-colors"
                      title="Cliquez pour modifier votre carnation"
                    >
                      <div 
                        className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-pink-400 transition-colors" 
                        style={{ backgroundColor: skinTones.find(t => t.id === selectedSkinTone)?.hex }} 
                      />
                      <span className="text-sm text-gray-700 group-hover:text-pink-600 font-medium transition-colors">
                        Carnation : {skinTones.find(t => t.id === selectedSkinTone)?.name}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-pink-500">✏️</span>
                    </button>
                  )}
                  
                  {item.note && <p className="mt-1 text-xs italic text-gray-500">{item.note}</p>}
                  <div className="mt-2">
                    <span className="font-bold text-gray-900">{product.price}€</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href={`/feed/${lookId}`} className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            Retour au look
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{look.title}</h1>
          <p className="text-lg text-gray-600">Sélectionnez les produits que vous souhaitez ajouter au panier</p>
        </div>

        {/* Info box */}
        <div className="mb-6 rounded-lg bg-pink-50 p-4 border border-pink-200">
          <p className="text-sm font-medium text-pink-900">
            {isAllProducts 
              ? '✨ Tous les produits du look sont pré-sélectionnés' 
              : `✨ ${checkedProducts.size} produit${checkedProducts.size > 1 ? 's' : ''} pré-sélectionné${checkedProducts.size > 1 ? 's' : ''}`
            }
          </p>
          <p className="text-xs text-pink-700 mt-1">
            Vous pouvez cocher/décocher les produits avant de valider
          </p>
        </div>

        {/* Liste des produits par catégorie */}
        <div className="mb-8">
          {renderProductsByCategory(categorizedProducts.peau, 'Peau')}
          {renderProductsByCategory(categorizedProducts.yeux, 'Yeux')}
          {renderProductsByCategory(categorizedProducts.cils, 'Cils')}
          {renderProductsByCategory(categorizedProducts.lèvres, 'Lèvres')}
        </div>

        {/* Récapitulatif et validation */}
        <div className="sticky bottom-0 rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <p className="text-sm text-gray-600">Total ({checkedProducts.size} produit{checkedProducts.size > 1 ? 's' : ''})</p>
              <p className="text-3xl font-bold text-gray-900">{calculateTotal()}€</p>
            </div>
          </div>
          
          <button
            onClick={handleValidate}
            disabled={checkedProducts.size === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold text-white transition-colors ${
              checkedProducts.size === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            Valider et ajouter au panier
          </button>
          
          {checkedProducts.size === 0 && (
            <p className="mt-2 text-center text-sm text-red-500">
              Veuillez sélectionner au moins un produit
            </p>
          )}
        </div>
      </main>

      {/* MODAL DE SÉLECTION DE CARNATION */}
      {showSkinToneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                🎨 Sélectionnez votre carnation de peau
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Choisissez la teinte qui correspond le mieux à votre peau pour vos produits de teint
              </p>
              {selectedSkinTone && (
                <div className="mt-3 flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg">
                  <div 
                    className="h-5 w-5 rounded-full border-2 border-pink-300" 
                    style={{ backgroundColor: skinTones.find(t => t.id === selectedSkinTone)?.hex }}
                  />
                  <span className="text-sm font-medium text-pink-900">
                    Actuellement : {skinTones.find(t => t.id === selectedSkinTone)?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Grille de carnations */}
            <div className="p-6">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {skinTones.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => handleSkinToneSelect(tone.id)}
                    className="relative group transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-full"
                    title={tone.name}
                  >
                    <div 
                      className="w-full aspect-square rounded-full border-3 border-gray-300 hover:border-pink-400 transition-all shadow-md hover:shadow-lg"
                      style={{ backgroundColor: tone.hex }}
                    />
                    {/* Tooltip qui s'affiche au hover */}
                    <span className="absolute hidden sm:group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 shadow-xl">
                      {tone.name}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
                    </span>
                    {/* Nom en dessous sur mobile */}
                    <span className="block sm:hidden text-[10px] text-gray-600 mt-1 text-center leading-tight">
                      {tone.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setShowSkinToneModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
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
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function CheckoutLookPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutLookContent lookId={lookId} />
    </Suspense>
  )
}