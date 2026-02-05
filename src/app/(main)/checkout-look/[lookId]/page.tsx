// /src/app/(main)/checkout-look/[lookId]/page.tsx

'use client'

import { use } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getLookById } from '@/data/mockLooks'
import { getProductById } from '@/data/mockProducts'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cart.store'

export default function CheckoutLookPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const look = getLookById(lookId)
  const addItem = useCartStore((state: any) => state?.addItem)

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

  const handleValidate = () => {
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
            quantity: 1
          })
        }
      }
    })
    
    // Rediriger vers le panier
    router.push('/cart')
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

    return (
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">{categoryTitle}</h3>
        <div className="space-y-3">
          {categoryProducts.map((item) => {
            const product = getProductById(item.productId)
            if (!product) return null

            const shade = product.shades?.find(s => s.id === item.shadeId)
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
                  {shade && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: shade.hex }} />
                      <span className="text-sm text-gray-600">{shade.name}</span>
                    </div>
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
    </div>
  )
}