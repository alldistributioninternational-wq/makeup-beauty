// src/app/(main)/checkout-look/[lookId]/page.tsx
'use client'

import { use, useEffect, Suspense, useState } from 'react'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/cloudinary'

interface Shade {
  id: string;
  name: string;
  hex: string;
}

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
    shades?: Shade[] | string | null;
  };
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
const SKIN_CATEGORIES = ['peau', 'highlighter', 'blush', 'contour']

const SKIN_TONES = [
  { id: '1',  name: 'Très clair rosé',    hex: '#FFE4D6' },
  { id: '2',  name: 'Clair rosé',         hex: '#FFDCC5' },
  { id: '3',  name: 'Clair neutre',       hex: '#FFD4B3' },
  { id: '4',  name: 'Clair chaud',        hex: '#FFCBA4' },
  { id: '5',  name: 'Moyen clair rosé',   hex: '#F5C6A5' },
  { id: '6',  name: 'Moyen clair neutre', hex: '#EAB896' },
  { id: '7',  name: 'Moyen clair chaud',  hex: '#E0AC7E' },
  { id: '8',  name: 'Moyen neutre',       hex: '#D4A276' },
  { id: '9',  name: 'Moyen chaud',        hex: '#C99869' },
  { id: '10', name: 'Moyen doré',         hex: '#BE8E5C' },
  { id: '11', name: 'Moyen foncé neutre', hex: '#B1824F' },
  { id: '12', name: 'Moyen foncé chaud',  hex: '#A47444' },
  { id: '13', name: 'Foncé neutre',       hex: '#8B6341' },
  { id: '14', name: 'Foncé chaud',        hex: '#7A5638' },
  { id: '15', name: 'Très foncé neutre',  hex: '#6B4A31' },
  { id: '16', name: 'Très foncé chaud',   hex: '#5D3F2A' },
  { id: '17', name: 'Profond neutre',     hex: '#4E3423' },
  { id: '18', name: 'Profond chaud',      hex: '#43291E' },
  { id: '19', name: 'Très profond',       hex: '#3A1F19' },
  { id: '20', name: 'Ultra profond',      hex: '#2C1614' },
]

function getAutoShadeFromSkinTone(skinToneId: string, shades: Shade[]): string {
  if (!shades.length) return ''
  const index = Math.round((parseInt(skinToneId) - 1) / 19 * (shades.length - 1))
  return shades[Math.max(0, Math.min(index, shades.length - 1))].id
}

function normalizeCategory(cat: string): string {
  const known = Object.keys(CATEGORY_DISPLAY)
  if (known.includes(cat)) return cat
  const map: Record<string, string> = {
    'teint': 'peau', 'correcteur': 'peau', 'fond-de-teint': 'peau',
    'mascara': 'cils', 'lèvres': 'levres',
    'fard à paupières': 'yeux', 'eye-liner': 'yeux', 'eyeliner': 'yeux',
    'rouge à lèvres': 'levres', 'gloss': 'levres',
  }
  return map[cat?.toLowerCase()?.trim()] || 'autre'
}

function parseShades(raw: any): Shade[] {
  if (!raw) return []
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function CheckoutLookContent({ lookId }: { lookId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const addItem = useCartStore((state: any) => state?.addItem)

  const [look,              setLook]              = useState<Look | null>(null)
  const [loading,           setLoading]           = useState(true)
  const [selectedSkinTone,  setSelectedSkinTone]  = useState<string | null>(null)
  const [showSkinToneModal, setShowSkinToneModal] = useState(false)
  const [checkedProducts,   setCheckedProducts]   = useState<Set<string>>(new Set())
  const [selectedShades,    setSelectedShades]    = useState<Record<string, string>>({})
  const [validateAttempts,  setValidateAttempts]  = useState(0)
  const [validateMessage,   setValidateMessage]   = useState<string | null>(null)

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

  useEffect(() => {
    if (look) {
      const checked = new Set<string>()
      const selectedParam = searchParams.get('selected')
      if (!selectedParam) {
        look.look_products?.forEach(item => checked.add(item.product_id))
      } else {
        selectedParam.split(',').forEach(item => checked.add(item))
      }
      setCheckedProducts(checked)

      const preShades: Record<string, string> = {}
      look.look_products?.forEach(item => {
        const shades = parseShades(item.products?.shades)
        if (shades.length > 0 && item.shade_id) {
          preShades[item.product_id] = item.shade_id
        }
      })
      setSelectedShades(preShades)
    }
  }, [look, searchParams])

  useEffect(() => {
    const saved = localStorage.getItem('userSkinTone')
    if (saved) setSelectedSkinTone(saved)
  }, [])

  useEffect(() => {
    if (!selectedSkinTone || !look) return
    const updates: Record<string, string> = { ...selectedShades }
    look.look_products?.forEach(item => {
      const shades = parseShades(item.products?.shades)
      if (shades.length > 0 && !updates[item.product_id]) {
        updates[item.product_id] = getAutoShadeFromSkinTone(selectedSkinTone, shades)
      }
    })
    setSelectedShades(updates)
  }, [selectedSkinTone]) // eslint-disable-line

  const toggleProductCheck = (productId: string) => {
    const next = new Set(checkedProducts)
    next.has(productId) ? next.delete(productId) : next.add(productId)
    setCheckedProducts(next)
  }

  const handleShadeSelect = (productId: string, shadeId: string) => {
    setSelectedShades(prev => ({ ...prev, [productId]: shadeId }))
  }

  const handleSkinToneSelect = (toneId: string) => {
    setSelectedSkinTone(toneId)
    localStorage.setItem('userSkinTone', toneId)
    setShowSkinToneModal(false)
    setValidateMessage(null)
    setValidateAttempts(0)
  }

  const calculateTotal = () => {
    let total = 0
    look?.look_products?.forEach(item => {
      if (checkedProducts.has(item.product_id)) total += Number(item.products.price)
    })
    return total.toFixed(2)
  }

  const hasMissingShadeOrTone = () => {
    return look?.look_products?.some(item => {
      if (!checkedProducts.has(item.product_id)) return false
      const shades = parseShades(item.products?.shades)
      const normalized = normalizeCategory(item.category)
      if (shades.length > 0 && !selectedShades[item.product_id]) return true
      if (shades.length === 0 && SKIN_CATEGORIES.includes(normalized) && !selectedSkinTone) return true
      return false
    })
  }

  const applyAutoShades = () => {
    const autoSkinTone = '8'
    const savedTone = selectedSkinTone || autoSkinTone
    if (!selectedSkinTone) {
      setSelectedSkinTone(savedTone)
      localStorage.setItem('userSkinTone', savedTone)
    }
    const updates: Record<string, string> = { ...selectedShades }
    look?.look_products?.forEach(item => {
      const shades = parseShades(item.products?.shades)
      if (shades.length > 0 && !updates[item.product_id]) {
        updates[item.product_id] = getAutoShadeFromSkinTone(savedTone, shades)
      }
    })
    setSelectedShades(updates)
    return updates
  }

  const addToCart = (overrideShades?: Record<string, string>, overrideSkinTone?: string) => {
    const shadeMap = overrideShades || selectedShades
    const skinTone = overrideSkinTone || selectedSkinTone
    look?.look_products?.forEach(item => {
      if (!checkedProducts.has(item.product_id)) return
      const product = item.products
      if (!product || !addItem) return
      const shades = parseShades(product.shades)
      const hasShades = shades.length > 0
      const isSkinCat = SKIN_CATEGORIES.includes(normalizeCategory(item.category))
      const chosenShadeId = hasShades ? (shadeMap[product.id] || '') : ''
      const shade = shades.find((s: Shade) => s.id === chosenShadeId)

      // ✅ Pour produits sans shades + catégorie peau → carnation = teinte
      const skinToneName = !hasShades && isSkinCat && skinTone
        ? SKIN_TONES.find(t => t.id === skinTone)?.name || ''
        : ''

      addItem({
        productId: product.id,
        shadeId: chosenShadeId,
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        image: getCloudinaryUrl(product.cloudinary_id),
        // ✅ shade = teinte choisie OU nom de carnation si produit peau sans shades
        shade: shade?.name || skinToneName,
        quantity: 1,
        skinTone: !hasShades && isSkinCat ? (skinTone || undefined) : undefined,
        look_id: look!.id,
      })
    })
    router.push('/cart')
  }

  const handleValidate = () => {
    if (!hasMissingShadeOrTone()) {
      addToCart()
      return
    }

    const newAttempts = validateAttempts + 1
    setValidateAttempts(newAttempts)

    if (newAttempts === 1) {
      setValidateMessage('💄 Veuillez choisir vos teintes avant de continuer.')
    } else if (newAttempts === 2) {
      setValidateMessage('🎨 Nous vous invitons vraiment à choisir vos teintes pour un résultat optimal !')
    } else {
      setValidateMessage(null)
      const autoShades = applyAutoShades()
      const autoTone = selectedSkinTone || '8'
      setTimeout(() => addToCart(autoShades, autoTone), 100)
    }
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
    const isSkinCategory = SKIN_CATEGORIES.includes(catKey)
    const hasSkinWithoutShades = isSkinCategory && items.some(item => {
      const shades = parseShades(item.products?.shades)
      return checkedProducts.has(item.product_id) && shades.length === 0
    })

    return (
      <div key={catKey} className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">
          {CATEGORY_DISPLAY[catKey]}
        </h3>

        {hasSkinWithoutShades && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 p-4 border-2 border-pink-200">
            {selectedSkinTone ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: SKIN_TONES.find(t => t.id === selectedSkinTone)?.hex }} />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Votre carnation</p>
                    <p className="text-base font-bold text-gray-900">
                      {SKIN_TONES.find(t => t.id === selectedSkinTone)?.name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowSkinToneModal(true)}
                  className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-lg border-2 border-pink-300">
                  ✏️ Modifier
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">🎨 Sélectionnez votre carnation</p>
                <button onClick={() => setShowSkinToneModal(true)}
                  className="w-full px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg">
                  Choisir ma carnation
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map(item => {
            const product = item.products
            if (!product) return null
            const isChecked = checkedProducts.has(product.id)
            const shades = parseShades(product.shades)
            const hasShades = shades.length > 0
            const chosenShadeId = selectedShades[product.id] || ''
            const isSkin = SKIN_CATEGORIES.includes(normalizeCategory(item.category))

            return (
              <div key={product.id}
                className={`rounded-xl border p-4 bg-white transition-all ${isChecked ? 'border-pink-300 shadow-sm' : 'border-gray-200'}`}>
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleProductCheck(product.id)}
                    className="h-5 w-5 rounded cursor-pointer accent-pink-500 mt-1"
                  />
                  <div className="relative flex-shrink-0">
                    {product.cloudinary_id ? (
                      <img src={getCloudinaryUrl(product.cloudinary_id)} alt={product.name}
                        className="h-20 w-20 object-cover rounded-lg" />
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">💄</div>
                    )}
                    {isSkin && !hasShades && selectedSkinTone && isChecked && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: SKIN_TONES.find(t => t.id === selectedSkinTone)?.hex }}
                        title={SKIN_TONES.find(t => t.id === selectedSkinTone)?.name}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    {item.note && <p className="text-xs italic text-gray-500 mt-1">{item.note}</p>}
                    <p className="font-bold text-gray-900 mt-1">{Number(product.price).toFixed(2)}€</p>

                    {isSkin && !hasShades && selectedSkinTone && isChecked && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: SKIN_TONES.find(t => t.id === selectedSkinTone)?.hex }} />
                        <span className="text-xs text-gray-600">
                          {SKIN_TONES.find(t => t.id === selectedSkinTone)?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {hasShades && isChecked && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Choisir la teinte :</p>
                    <div className="flex flex-wrap gap-2">
                      {shades.map((shade: Shade) => (
                        <button
                          key={shade.id}
                          onClick={() => handleShadeSelect(product.id, shade.id)}
                          title={shade.name}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                            chosenShadeId === shade.id
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white shadow-sm"
                            style={{ backgroundColor: shade.hex }} />
                          {shade.name}
                        </button>
                      ))}
                    </div>
                    {!chosenShadeId && (
                      <p className="text-xs text-orange-500 mt-1.5">⚠️ Aucune teinte sélectionnée</p>
                    )}
                  </div>
                )}
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
          <Link href={`/feed/${lookId}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
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
          <p className="text-sm text-gray-600 mb-1">
            Total ({checkedProducts.size} produit{checkedProducts.size > 1 ? 's' : ''})
          </p>
          <p className="text-3xl font-bold mb-3">{calculateTotal()}€</p>

          {validateMessage && (
            <div className={`mb-3 px-4 py-3 rounded-xl text-sm font-medium ${
              validateAttempts === 1
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {validateMessage}
            </div>
          )}

          <button
            onClick={handleValidate}
            disabled={checkedProducts.size === 0}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
              checkedProducts.size === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            <ShoppingCart className="inline h-5 w-5 mr-2" />
            {validateAttempts >= 2 && hasMissingShadeOrTone()
              ? 'Continuer sans teinte →'
              : 'Valider et ajouter au panier'
            }
          </button>
        </div>
      </main>

      {showSkinToneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">🎨 Sélectionnez votre carnation</h2>
              <p className="text-sm text-gray-500 mt-1">
                Sera appliquée aux produits de teint sans teinte spécifique
              </p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-2">
              {SKIN_TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => handleSkinToneSelect(tone.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                    selectedSkinTone === tone.id ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow"
                    style={{ backgroundColor: tone.hex }} />
                  <span className="text-sm text-left text-gray-700 font-medium">{tone.name}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t">
              <button onClick={() => setShowSkinToneModal(false)}
                className="w-full py-3 bg-gray-200 rounded-lg font-semibold">
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-pink-500 rounded-full" />
      </div>
    }>
      <CheckoutLookContent lookId={lookId} />
    </Suspense>
  )
}