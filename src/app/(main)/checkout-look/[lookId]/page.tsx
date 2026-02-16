// src/app/(main)/checkout-look/[lookId]/page.tsx
// Version Supabase + Cloudinary - Images produits depuis Cloudinary

'use client'

import { use, useEffect, Suspense, useState } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/cloudinary'

// Types
interface Look {
  id: string;
  title: string;
  description?: string;
  look_products?: LookProduct[];
}

interface LookProduct {
  product_id: string;
  shade_id?: string;
  category: string;
  note?: string;
  products: {
    id: string;
    name: string;
    brand: string;
    price: number;
    cloudinary_id: string | null;
    shades?: any;
  };
}

function CheckoutLookContent({ lookId }: { lookId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((state: any) => state?.addItem)

  const [look, setLook] = useState<Look | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null)
  const [showSkinToneModal, setShowSkinToneModal] = useState(false)
  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(new Set())

  // ✅ Charger le look depuis Supabase
  useEffect(() => {
    async function fetchLook() {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('looks')
        .select(`
          *,
          look_products (
            product_id,
            shade_id,
            category,
            note,
            products (
              id,
              name,
              brand,
              price,
              cloudinary_id,
              shades
            )
          )
        `)
        .eq('id', lookId)
        .single()

      if (error || !data) {
        notFound()
      } else {
        setLook(data)
      }
      
      setLoading(false)
    }

    fetchLook()
  }, [lookId])

  const selectedParam = searchParams.get('selected')
  const isAllProducts = !selectedParam

  useEffect(() => {
    if (look) {
      const checked = new Set<string>()
      
      if (isAllProducts) {
        look.look_products?.forEach(item => {
          const key = item.shade_id ? `${item.product_id}-${item.shade_id}` : item.product_id
          checked.add(key)
        })
      } else if (selectedParam) {
        selectedParam.split(',').forEach(item => checked.add(item))
      }
      
      setCheckedProducts(checked)
    }
  }, [look, selectedParam, isAllProducts])

  useEffect(() => {
    const savedSkinTone = localStorage.getItem('userSkinTone')
    if (savedSkinTone) {
      setSelectedSkinTone(savedSkinTone)
    }
  }, [])

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

  const hasSkinProducts = () => {
    return look?.look_products?.some(item => {
      const isChecked = isProductChecked(item.product_id, item.shade_id)
      const isSkinProduct = ['Teint', 'Correcteur', 'Poudre'].includes(item.category)
      return isChecked && isSkinProduct
    })
  }

  const calculateTotal = () => {
    let total = 0
    look?.look_products?.forEach(item => {
      if (isProductChecked(item.product_id, item.shade_id)) {
        total += Number(item.products.price)
      }
    })
    return total.toFixed(2)
  }

  const handleSkinToneSelect = (toneId: string) => {
    setSelectedSkinTone(toneId)
    localStorage.setItem('userSkinTone', toneId)
    setShowSkinToneModal(false)
  }

  const addToCart = () => {
    look?.look_products?.forEach(item => {
      if (isProductChecked(item.product_id, item.shade_id)) {
        const product = item.products
        if (product && addItem) {
          let shades = []
          if (product.shades) {
            shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades
          }

          const shade = shades.find((s: any) => s.id === item.shade_id)
          
          addItem({
            productId: product.id,
            shadeId: item.shade_id || '',
            name: product.name,
            brand: product.brand,
            price: Number(product.price),
            image: getCloudinaryUrl(product.cloudinary_id),
            shade: shade?.name || '',
            quantity: 1,
            skinTone: selectedSkinTone || undefined
          })
        }
      }
    })
    
    router.push('/cart')
  }

  const handleValidate = () => {
    if (hasSkinProducts() && !selectedSkinTone) {
      setShowSkinToneModal(true)
      return
    }
    addToCart()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!look) notFound()

  const categorizedProducts = {
    peau: look.look_products?.filter(p => ['Teint', 'Correcteur', 'Poudre', 'Blush', 'Highlighter'].includes(p.category)) || [],
    cils: look.look_products?.filter(p => p.category === 'Mascara') || [],
    yeux: look.look_products?.filter(p => ['Fard à paupières', 'Eye-liner', 'Sourcils'].includes(p.category)) || [],
    lèvres: look.look_products?.filter(p => ['Rouge à lèvres', 'Gloss'].includes(p.category)) || []
  }

  const renderProductsByCategory = (categoryProducts: LookProduct[], categoryTitle: string) => {
    if (categoryProducts.length === 0) return null

    const isSkinCategory = categoryTitle === 'Peau'

    return (
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">{categoryTitle}</h3>

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
                    <p className="text-xs font-semibold text-gray-700">Votre carnation</p>
                    <p className="text-base font-bold text-gray-900">
                      {skinTones.find(t => t.id === selectedSkinTone)?.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowSkinToneModal(true)} className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-lg border-2 border-pink-300">
                  ✏️ Modifier
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">🎨 Sélectionnez votre carnation</p>
                <button onClick={() => setShowSkinToneModal(true)} className="w-full px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg">
                  Choisir ma carnation
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {categoryProducts.map((item) => {
            const product = item.products
            if (!product) return null

            const isChecked = isProductChecked(product.id, item.shade_id)

            return (
              <div key={`${product.id}-${item.shade_id}`} className="flex gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleProductCheck(product.id, item.shade_id)}
                  className="h-5 w-5 rounded cursor-pointer accent-pink-500"
                />
                <img 
                  src={getCloudinaryUrl(product.cloudinary_id)}
                  alt={product.name} 
                  className="h-20 w-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  {item.note && <p className="text-xs italic text-gray-500 mt-1">{item.note}</p>}
                  <p className="font-bold text-gray-900 mt-2">{Number(product.price).toFixed(2)}€</p>
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
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href={`/feed/${lookId}`} className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Retour au look
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{look.title}</h1>
        <p className="mb-6 text-gray-600">Sélectionnez les produits à ajouter au panier</p>

        {renderProductsByCategory(categorizedProducts.peau, 'Peau')}
        {renderProductsByCategory(categorizedProducts.yeux, 'Yeux')}
        {renderProductsByCategory(categorizedProducts.cils, 'Cils')}
        {renderProductsByCategory(categorizedProducts.lèvres, 'Lèvres')}

        <div className="sticky bottom-0 bg-white p-6 border rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Total ({checkedProducts.size} produit{checkedProducts.size > 1 ? 's' : ''})</p>
          <p className="text-3xl font-bold mb-4">{calculateTotal()}€</p>
          
          <button
            onClick={handleValidate}
            disabled={checkedProducts.size === 0}
            className={`w-full py-4 rounded-lg font-semibold text-white ${checkedProducts.size === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}`}
          >
            <ShoppingCart className="inline h-5 w-5 mr-2" />
            Valider et ajouter au panier
          </button>
        </div>
      </main>

      {showSkinToneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">🎨 Sélectionnez votre carnation</h2>
            </div>
            <div className="p-6 grid grid-cols-8 gap-3">
              {skinTones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleSkinToneSelect(tone.id)}
                  className="aspect-square rounded-full border-3 shadow-md hover:scale-105 transition"
                  style={{ backgroundColor: tone.hex }}
                  title={tone.name}
                />
              ))}
            </div>
            <div className="p-6 border-t">
              <button onClick={() => setShowSkinToneModal(false)} className="w-full py-3 bg-gray-200 rounded-lg font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutLookPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-pink-500 rounded-full"></div></div>}>
      <CheckoutLookContent lookId={lookId} />
    </Suspense>
  )
}