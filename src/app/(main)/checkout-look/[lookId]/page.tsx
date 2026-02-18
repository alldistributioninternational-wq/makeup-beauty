// src/app/(main)/checkout-look/[lookId]/page.tsx
'use client'

import { use, useEffect, Suspense, useState } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/cloudinary'

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

// ✅ CATÉGORIES UNIFIÉES — exactement comme dans feed
const CATEGORY_GROUPS: Record<string, string[]> = {
  peau:        ['peau'],
  yeux:        ['yeux'],
  cils:        ['cils'],
  levres:      ['levres'],
  sourcils:    ['sourcils'],
  highlighter: ['highlighter'],
  blush:       ['blush'],
  contour:     ['contour'],
  autre:       ['autre'],
}

const CATEGORY_DISPLAY: Record<string, string> = {
  peau:        '✨ Peau',
  yeux:        '👁️ Yeux',
  cils:        '🪄 Cils',
  levres:      '💋 Lèvres',
  sourcils:    '🎨 Sourcils',
  highlighter: '⭐ Highlighter',
  blush:       '🌸 Blush',
  contour:     '🔲 Contour',
  autre:       '📦 Autre',
}

const DISPLAY_ORDER = ['peau', 'yeux', 'cils', 'levres', 'sourcils', 'highlighter', 'blush', 'contour', 'autre']

// Normalise les vieilles catégories
function normalizeCategory(cat: string): string {
  const known = Object.keys(CATEGORY_GROUPS)
  if (known.includes(cat)) return cat
  const map: Record<string, string> = {
    'teint': 'peau', 'correcteur': 'peau', 'fond-de-teint': 'peau',
    'mascara': 'cils', 'lèvres': 'levres',
    'fard à paupières': 'yeux', 'eye-liner': 'yeux', 'eyeliner': 'yeux',
    'rouge à lèvres': 'levres', 'gloss': 'levres',
  }
  return map[cat?.toLowerCase()?.trim()] || 'autre'
}

function CheckoutLookContent({ lookId }: { lookId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((state: any) => state?.addItem)

  const [look,             setLook]             = useState<Look | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null)
  const [showSkinToneModal, setShowSkinToneModal] = useState(false)
  const [checkedProducts,  setCheckedProducts]  = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchLook() {
      setLoading(true)
      const { data, error } = await supabase
        .from('looks')
        .select(`*, look_products (product_id, shade_id, category, note, products (id, name, brand, price, cloudinary_id, shades))`)
        .eq('id', lookId)
        .single()
      if (error || !data) { notFound() } else { setLook(data) }
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
    const saved = localStorage.getItem('userSkinTone')
    if (saved) setSelectedSkinTone(saved)
  }, [])

  const skinTones = [
    { id: '1',  name: 'Très clair rosé',        hex: '#FFE4D6' },
    { id: '2',  name: 'Clair rosé',             hex: '#FFDCC5' },
    { id: '3',  name: 'Clair neutre',           hex: '#FFD4B3' },
    { id: '4',  name: 'Clair chaud',            hex: '#FFCBA4' },
    { id: '5',  name: 'Moyen clair rosé',       hex: '#F5C6A5' },
    { id: '6',  name: 'Moyen clair neutre',     hex: '#EAB896' },
    { id: '7',  name: 'Moyen clair chaud',      hex: '#E0AC7E' },
    { id: '8',  name: 'Moyen neutre',           hex: '#D4A276' },
    { id: '9',  name: 'Moyen chaud',            hex: '#C99869' },
    { id: '10', name: 'Moyen doré',             hex: '#BE8E5C' },
    { id: '11', name: 'Moyen foncé neutre',     hex: '#B1824F' },
    { id: '12', name: 'Moyen foncé chaud',      hex: '#A47444' },
    { id: '13', name: 'Foncé neutre',           hex: '#8B6341' },
    { id: '14', name: 'Foncé chaud',            hex: '#7A5638' },
    { id: '15', name: 'Très foncé neutre',      hex: '#6B4A31' },
    { id: '16', name: 'Très foncé chaud',       hex: '#5D3F2A' },
    { id: '17', name: 'Profond neutre',         hex: '#4E3423' },
    { id: '18', name: 'Profond chaud',          hex: '#43291E' },
    { id: '19', name: 'Très profond',           hex: '#3A1F19' },
    { id: '20', name: 'Ultra profond',          hex: '#2C1614' },
  ]

  const toggleProductCheck = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    const next = new Set(checkedProducts)
    next.has(key) ? next.delete(key) : next.add(key)
    setCheckedProducts(next)
  }

  const isProductChecked = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    return checkedProducts.has(key)
  }

  const hasSkinProducts = () => {
    return look?.look_products?.some(item => {
      const isChecked = isProductChecked(item.product_id, item.shade_id)
      const normalized = normalizeCategory(item.category)
      const isSkinProduct = ['peau', 'highlighter', 'blush', 'contour'].includes(normalized)
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
          let shades: any[] = []
          if (product.shades) {
            try {
              shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades
            } catch { shades = [] }
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )

  if (!look) notFound()

  // ✅ Grouper avec normalisation
  const allProducts = look.look_products || []
  const grouped: Record<string, LookProduct[]> = {}
  DISPLAY_ORDER.forEach(k => { grouped[k] = [] })

  allProducts.forEach(item => {
    const normalized = normalizeCategory(item.category)
    if (!grouped[normalized]) grouped[normalized] = []
    grouped[normalized].push(item)
  })

  const renderGroup = (catKey: string) => {
    const items = grouped[catKey] || []
    if (items.length === 0) return null
    const isSkinCategory = ['peau', 'highlighter', 'blush', 'contour'].includes(catKey)

    return (
      <div key={catKey} className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">
          {CATEGORY_DISPLAY[catKey]}
        </h3>

        {isSkinCategory && hasSkinProducts() && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-2 border-pink-200">
            {selectedSkinTone ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-3 border-white shadow-md" style={{ backgroundColor: skinTones.find(t => t.id === selectedSkinTone)?.hex }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Votre carnation</p>
                    <p className="text-base font-bold text-gray-900">{skinTones.find(t => t.id === selectedSkinTone)?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowSkinToneModal(true)} className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-lg border-2 border-pink-300">✏️ Modifier</button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">🎨 Sélectionnez votre carnation</p>
                <button onClick={() => setShowSkinToneModal(true)} className="w-full px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg">Choisir ma carnation</button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map(item => {
            const product = item.products
            if (!product) return null
            const isChecked = isProductChecked(product.id, item.shade_id)

            return (
              <div key={`${product.id}-${item.shade_id || 'no-shade'}`} className="flex gap-4 rounded-xl border border-gray-200 p-4 bg-white">
                <input type="checkbox" checked={isChecked} onChange={() => toggleProductCheck(product.id, item.shade_id)} className="h-5 w-5 rounded cursor-pointer accent-pink-500" />
                {product.cloudinary_id ? (
                  <img src={getCloudinaryUrl(product.cloudinary_id)} alt={product.name} className="h-20 w-20 object-cover rounded-lg" />
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">💄</div>
                )}
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
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href={`/feed/${lookId}`} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />Retour au look
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">{look.title}</h1>
        <p className="mb-6 text-gray-600">Sélectionnez les produits à ajouter au panier</p>

        {DISPLAY_ORDER.map(k => renderGroup(k))}

        {allProducts.length === 0 && (
          <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-lg font-semibold text-yellow-800">⚠️ Aucun produit trouvé pour ce look</p>
            <p className="text-sm text-yellow-600 mt-2">Vérifiez que des produits sont bien associés à ce look dans l'admin</p>
          </div>
        )}

        <div className="sticky bottom-0 bg-white p-6 border rounded-lg shadow-lg mt-6">
          <p className="text-sm text-gray-600 mb-1">Total ({checkedProducts.size} produit{checkedProducts.size > 1 ? 's' : ''})</p>
          <p className="text-3xl font-bold mb-4">{calculateTotal()}€</p>
          <button onClick={handleValidate} disabled={checkedProducts.size === 0}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${checkedProducts.size === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}`}>
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
              {skinTones.map(tone => (
                <button key={tone.id} onClick={() => handleSkinToneSelect(tone.id)}
                  className="aspect-square rounded-full border-3 shadow-md hover:scale-105 transition"
                  style={{ backgroundColor: tone.hex }}
                  title={tone.name} />
              ))}
            </div>
            <div className="p-6 border-t">
              <button onClick={() => setShowSkinToneModal(false)} className="w-full py-3 bg-gray-200 rounded-lg font-semibold">Annuler</button>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-pink-500 rounded-full" /></div>}>
      <CheckoutLookContent lookId={lookId} />
    </Suspense>
  )
}