'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getLookById } from '@/data/mockLooks'
import { getProductById } from '@/data/mockProducts'
import { ArrowLeft, Heart, Share2, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useState } from 'react'

export default function LookDetailPage({ params }: { params: Promise<{ lookId: string }> }) {
  const { lookId } = use(params)
  const look = getLookById(lookId)
  const addItem = useCartStore((state: any) => state?.addItem)
  const [addedProducts, setAddedProducts] = useState<string[]>([])

  if (!look) {
    notFound()
  }

  const handleAddToCart = (productId: string, shadeId?: string) => {
    if (addItem) {
      addItem({ productId, shadeId, quantity: 1 })
      setAddedProducts([...addedProducts, productId])
      setTimeout(() => {
        setAddedProducts(addedProducts.filter(id => id !== productId))
      }, 2000)
    }
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
            <img 
              src={look.image} 
              alt={look.title}
              className="h-full w-full object-cover"
            />
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
              <button className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-200">
                <Share2 className="h-4 w-4" />
                Partager
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Par <span className="font-semibold text-gray-900">{look.creator.name}</span> {look.creator.username}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Produits utilisés</h2>
              <div className="space-y-4">
                {look.products.map((item) => {
                  const product = getProductById(item.productId)
                  if (!product) return null

                  const shade = product.shades?.find(s => s.id === item.shadeId)
                  const isAdded = addedProducts.includes(product.id)

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
                            onClick={() => handleAddToCart(product.id, item.shadeId)}
                            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                              isAdded ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                          >
                            {isAdded ? '✓ Ajouté' : 'Ajouter'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}