'use client'

import { use, useState, useRef, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl, getCloudinaryVideoUrl } from '@/lib/cloudinary'

interface Look {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  cloudinary_image_id: string | null;
  cloudinary_video_id: string | null;
  creator_name?: string;
  creator_username?: string;
  likes?: number;
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

// ✅ LISTE UNIFIÉE — même IDs que l'admin
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

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  'facile':        { label: 'Facile',        color: 'bg-green-100 text-green-700'   },
  'intermédiaire': { label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-700' },
  'difficile':     { label: 'Difficile',     color: 'bg-red-100 text-red-700'       },
}

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

export default function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  const router = useRouter()
  
  const [look,             setLook]             = useState<Look | null>(null)
  const [loading,          setLoading]          = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isMobile,         setIsMobile]         = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (videoRef.current && look?.cloudinary_video_id) {
      const video = videoRef.current
      video.muted = isMobile
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}) })
    }
  }, [look?.cloudinary_video_id, isMobile])

  const toggleProductSelection = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    const next = new Set(selectedProducts)
    next.has(key) ? next.delete(key) : next.add(key)
    setSelectedProducts(next)
  }

  const isProductSelected = (productId: string, shadeId?: string) =>
    selectedProducts.has(shadeId ? `${productId}-${shadeId}` : productId)

  const handleBuyLook = () => {
    if (selectedProducts.size === 0) router.push(`/checkout-look/${lookId}`)
    else router.push(`/checkout-look/${lookId}?selected=${Array.from(selectedProducts).join(',')}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" /><p className="text-gray-600">Chargement...</p></div>
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
    return (
      <div key={catKey} className="mb-6">
        <h3 className="mb-3 text-base font-bold text-gray-800 uppercase tracking-wide">{CATEGORY_DISPLAY[catKey]}</h3>
        <div className="space-y-3">
          {items.map(item => {
            const product = item.products
            if (!product) return null

            let shades: any[] = []
            if (product.shades) {
              try { shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades } catch { shades = [] }
            }

            const shade      = shades.find((s: any) => s.id === item.shade_id)
            const isSelected = isProductSelected(product.id, item.shade_id)
            const isSkin     = ['peau', 'highlighter', 'blush', 'contour'].includes(normalizeCategory(item.category))

            return (
              <div key={`${product.id}-${item.shade_id}`} className="flex gap-4 rounded-xl border border-gray-200 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {product.cloudinary_id
                    ? <img src={getCloudinaryUrl(product.cloudinary_id)} alt={product.name} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center text-2xl">💄</div>
                  }
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  {!isSkin && shade && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: shade.hex }} />
                      <span className="text-sm text-gray-600">{shade.name}</span>
                    </div>
                  )}
                  {item.note && <p className="mt-1 text-xs italic text-gray-500">{item.note}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span>
                    <button onClick={() => toggleProductSelection(product.id, item.shade_id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isSelected ? 'bg-pink-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                      {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const imageUrl   = getCloudinaryUrl(look.cloudinary_image_id)
  const videoUrl   = look.cloudinary_video_id ? getCloudinaryVideoUrl(look.cloudinary_video_id) : null
  
  // ✅ Toujours afficher un badge difficulté (par défaut "Facile")
  const diffKey = look.difficulty?.toLowerCase() || 'facile'
  const diffConfig = DIFFICULTY_CONFIG[diffKey] || DIFFICULTY_CONFIG['facile']

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />Retour au feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Média */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            {videoUrl ? (
              <video ref={videoRef} src={videoUrl} className="h-full w-full object-cover" autoPlay loop playsInline preload="auto" controls />
            ) : (
              <img src={imageUrl} alt={look.title} className="h-full w-full object-cover" />
            )}
          </div>

          {/* Détails */}
          <div>
            <div className="mb-4">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{look.title}</h1>
              {look.description && <p className="text-lg text-gray-600">{look.description}</p>}
            </div>

            {/* ✅ Badge difficulté toujours affiché */}
            <div className="mb-4 flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${diffConfig.color}`}>
                <Zap className="h-3.5 w-3.5" />{diffConfig.label}
              </span>
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200">
                <Heart className="h-4 w-4" />{look.likes || 0}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Par <span className="font-semibold text-gray-900">{look.creator_name || 'Créateur'}</span>
                {look.creator_username && <span className="ml-1 text-gray-400">{look.creator_username}</span>}
              </p>
            </div>

            <div className="mb-6 rounded-lg bg-pink-50 p-4 border border-pink-200">
              <p className="text-sm font-medium text-pink-900">✨ Sélectionnez les produits que vous souhaitez acheter</p>
              <p className="text-xs text-pink-700 mt-1">
                {selectedProducts.size > 0
                  ? `${selectedProducts.size} produit${selectedProducts.size > 1 ? 's' : ''} sélectionné${selectedProducts.size > 1 ? 's' : ''}`
                  : 'Aucun sélectionné — "Acheter" pour tout prendre'}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Produits utilisés
                <span className="ml-2 text-sm font-normal text-gray-400">({allProducts.length})</span>
              </h2>
              {allProducts.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Aucun produit associé</p>
              ) : (
                DISPLAY_ORDER.map(k => renderGroup(k))
              )}
            </div>

            <div className="sticky bottom-0 mt-8 border-t border-gray-200 bg-white pt-4 pb-6">
              <button onClick={handleBuyLook}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-6 py-4 text-lg font-semibold text-white hover:bg-pink-600">
                <ShoppingBag className="h-5 w-5" />
                {selectedProducts.size > 0 ? `Acheter ${selectedProducts.size} produit${selectedProducts.size > 1 ? 's' : ''}` : 'Acheter le Look complet'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}