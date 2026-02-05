// /src/app/(main)/feed/[lookId]/page.tsx

'use client'

import { use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getLookById } from '@/data/mockLooks'
import { getProductById } from '@/data/mockProducts'
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  const look = getLookById(lookId)
  const router = useRouter()
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!look) {
    notFound()
  }

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (videoRef.current && look.video) {
      const video = videoRef.current
      
      // Mobile = muted, Desktop = avec son
      video.muted = isMobile
      
      const playVideo = async () => {
        try {
          await video.play()
        } catch (error) {
          console.log('Erreur autoplay:', error)
          // Si ça échoue en desktop, essayer en muted
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
  }, [look.video, isMobile])

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
            const isSelected = isProductSelected(product.id, item.shadeId)

            return (
              <div key={`${item.productId}-${item.shadeId}`} className="flex gap-4 rounded-xl border border-gray-200 p-4">
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
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-gray-900">{product.price}€</span>
                    <button
                      onClick={() => toggleProductSelection(product.id, item.shadeId)}
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
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            {look.video ? (
              <video 
                ref={videoRef}
                src={look.video} 
                className="h-full w-full object-cover"
                autoPlay
                loop
                playsInline
                preload="auto"
                controls
              />
            ) : (
              <img 
                src={look.image} 
                alt={look.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div>
            <div className="mb-6">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{look.title}</h1>
              <p className="text-lg text-gray-600">{look.description}</p>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-200">
                <Heart className="h-4 w-4" />
                {look.likes}
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Par <span className="font-semibold text-gray-900">{look.creator.name}</span> {look.creator.username}
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