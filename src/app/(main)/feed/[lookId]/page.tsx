// src/app/(main)/feed/[lookId]/page.tsx
// Version Supabase + Cloudinary - Images et vidéos depuis Cloudinary

'use client'

import { use, useState, useRef, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCloudinaryUrl, getCloudinaryVideoUrl } from '@/lib/cloudinary'

// Types
interface Look {
  id: string;
  title: string;
  description?: string;
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

export default function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  const router = useRouter()
  
  const [look, setLook] = useState<Look | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (videoRef.current && look?.cloudinary_video_id) {
      const video = videoRef.current
      video.muted = isMobile
      
      const playVideo = async () => {
        try {
          await video.play()
        } catch (error) {
          console.log('Erreur autoplay:', error)
          if (!isMobile) {
            video.muted = true
            try {
              await video.play()
            } catch (e) {
              console.log('Autoplay complètement bloqué')
            }
          }
        }
      }
      
      playVideo()
    }
  }, [look?.cloudinary_video_id, isMobile])

  const toggleProductSelection = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    const newSelected = new Set(selectedProducts)
    
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    
    setSelectedProducts(newSelected)
  }

  const isProductSelected = (productId: string, shadeId?: string) => {
    const key = shadeId ? `${productId}-${shadeId}` : productId
    return selectedProducts.has(key)
  }

  const handleBuyLook = () => {
    if (selectedProducts.size === 0) {
      router.push(`/checkout-look/${lookId}`)
    } else {
      const selectedItems = Array.from(selectedProducts).join(',')
      router.push(`/checkout-look/${lookId}?selected=${selectedItems}`)
    }
  }

  const isSkinProduct = (category: string) => {
    return ['Teint', 'Correcteur', 'Poudre'].includes(category)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du look...</p>
        </div>
      </div>
    )
  }

  if (!look) {
    notFound()
  }

  // Organiser les produits par catégorie
  const categorizedProducts = {
    peau: look.look_products?.filter(p => ['Teint', 'Correcteur', 'Poudre', 'Blush', 'Highlighter'].includes(p.category)) || [],
    cils: look.look_products?.filter(p => p.category === 'Mascara') || [],
    yeux: look.look_products?.filter(p => ['Fard à paupières', 'Eye-liner', 'Sourcils'].includes(p.category)) || [],
    lèvres: look.look_products?.filter(p => ['Rouge à lèvres', 'Gloss'].includes(p.category)) || []
  }

  const renderProductsByCategory = (categoryProducts: LookProduct[], categoryTitle: string) => {
    if (categoryProducts.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800 uppercase tracking-wide">{categoryTitle}</h3>
        <div className="space-y-3">
          {categoryProducts.map((item) => {
            const product = item.products
            if (!product) return null

            // Parser les shades
            let shades = []
            if (product.shades) {
              if (typeof product.shades === 'string') {
                try {
                  shades = JSON.parse(product.shades)
                } catch {
                  shades = []
                }
              } else {
                shades = product.shades
              }
            }

            const shade = shades.find((s: any) => s.id === item.shade_id)
            const isSelected = isProductSelected(product.id, item.shade_id)
            const isSkin = isSkinProduct(item.category)

            return (
              <div key={`${product.id}-${item.shade_id}`} className="flex gap-4 rounded-xl border border-gray-200 p-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <img 
                    src={getCloudinaryUrl(product.cloudinary_id)}
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  
                  {/* Afficher le shade UNIQUEMENT si ce n'est PAS un produit de peau */}
                  {!isSkin && shade && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border border-gray-300" style={{ backgroundColor: shade.hex }} />
                      <span className="text-sm text-gray-600">{shade.name}</span>
                    </div>
                  )}
                  
                  {item.note && <p className="mt-1 text-xs italic text-gray-500">{item.note}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span>
                    <button
                      onClick={() => toggleProductSelection(product.id, item.shade_id)}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        isSelected ? 'bg-pink-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
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

  // URLs Cloudinary
  const imageUrl = getCloudinaryUrl(look.cloudinary_image_id)
  const videoUrl = getCloudinaryVideoUrl(look.cloudinary_video_id)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            Retour au feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Média (Vidéo ou Image) */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            {videoUrl ? (
              <video 
                ref={videoRef}
                src={videoUrl}
                className="h-full w-full object-cover"
                autoPlay
                loop
                playsInline
                preload="auto"
                controls
              />
            ) : (
              <img 
                src={imageUrl}
                alt={look.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Détails du look */}
          <div>
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{look.title}</h1>
              <p className="text-lg text-gray-600">{look.description}</p>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-200">
                <Heart className="h-4 w-4" />
                {look.likes || 0}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Par <span className="font-semibold text-gray-900">{look.creator_name || 'Créateur'}</span> {look.creator_username || '@user'}
              </p>
            </div>

            <div className="mb-6 rounded-lg bg-pink-50 p-4 border border-pink-200">
              <p className="text-sm font-medium text-pink-900">
                ✨ Sélectionnez les produits du look que vous souhaitez acheter
              </p>
              <p className="text-xs text-pink-700 mt-1">
                {selectedProducts.size > 0 
                  ? `${selectedProducts.size} produit${selectedProducts.size > 1 ? 's' : ''} sélectionné${selectedProducts.size > 1 ? 's' : ''}`
                  : 'Aucun produit sélectionné'}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Produits utilisés</h2>
              
              {renderProductsByCategory(categorizedProducts.peau, 'Peau')}
              {renderProductsByCategory(categorizedProducts.yeux, 'Yeux')}
              {renderProductsByCategory(categorizedProducts.cils, 'Cils')}
              {renderProductsByCategory(categorizedProducts.lèvres, 'Lèvres')}
            </div>

            <div className="sticky bottom-0 mt-8 border-t border-gray-200 bg-white pt-4 pb-6">
              <button
                onClick={handleBuyLook}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-pink-500 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-pink-600"
              >
                <ShoppingBag className="h-5 w-5" />
                Acheter le Look
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}