// src/app/(main)/shop/products/[productId]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import React from 'react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cloudinary_id: string | null;
  category: string;
  description?: string;
  shades?: any;
  in_stock: boolean;
  is_featured: boolean;
}

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { productId } = React.use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedShadeId, setSelectedShadeId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        notFound();
      } else {
        setProduct(data);
        // Sélectionner la première shade par défaut
        let shades: any[] = [];
        if (data.shades) {
          try {
            shades = typeof data.shades === 'string' ? JSON.parse(data.shades) : data.shades;
          } catch { shades = []; }
        }
        if (shades.length > 0) setSelectedShadeId(shades[0].id);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !addItem) return;

    let shades: any[] = [];
    if (product.shades) {
      try {
        shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades;
      } catch { shades = []; }
    }
    const selectedShade = shades.find((s: any) => s.id === selectedShadeId);

    addItem({
      productId: product.id,
      shadeId: selectedShadeId || '',
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      image: getCloudinaryUrl(product.cloudinary_id),
      shade: selectedShade?.name || '',
      quantity,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      router.push('/cart');
    }, 1000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
    </div>
  );

  if (!product) return notFound();

  let shades: any[] = [];
  if (product.shades) {
    try {
      shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades;
    } catch { shades = []; }
  }
  const selectedShade = shades.find((s: any) => s.id === selectedShadeId);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Retour au shop
            </Link>
            <Link href="/cart" className="text-sm font-medium hover:text-gray-600">
              Panier
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {product.cloudinary_id ? (
                <img
                  src={getCloudinaryUrl(product.cloudinary_id)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-8xl">💄</div>
              )}
              {product.is_featured && (
                <div className="absolute left-4 top-4 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                  ⭐ Bestseller
                </div>
              )}
            </div>
          </div>

          {/* Product info */}
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              {product.brand} • {product.category}
            </p>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>

            <p className="mb-6 text-2xl font-bold text-gray-900">{Number(product.price).toFixed(2)}€</p>

            {product.description && (
              <p className="mb-8 text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Shade selector */}
            {shades.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    Teinte{selectedShade ? `: ${selectedShade.name}` : ''}
                  </h3>
                  <span className="text-sm text-gray-500">{shades.length} teintes disponibles</span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {shades.map((shade: any) => (
                    <button
                      key={shade.id}
                      onClick={() => setSelectedShadeId(shade.id)}
                      className={`group relative aspect-square rounded-lg border-2 transition-all ${
                        selectedShadeId === shade.id
                          ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="h-full w-full rounded-md" style={{ backgroundColor: shade.hex || shade.color || '#ccc' }} />
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {shade.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="mb-3 font-semibold text-gray-900">Quantité</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 font-semibold hover:bg-gray-50"
                >
                  −
                </button>
                <span className="flex h-10 w-16 items-center justify-center rounded-lg border border-gray-300 font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 font-semibold hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAdded}
                className={`w-full rounded-lg py-4 font-semibold transition-all ${
                  !product.in_stock
                    ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                    : isAdded
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {!product.in_stock ? (
                  'Rupture de stock'
                ) : isAdded ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    Ajouté ! Redirection...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ajouter au panier • {(Number(product.price) * quantity).toFixed(2)}€
                  </span>
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full rounded-lg border border-gray-300 py-4 text-center font-semibold transition-colors hover:bg-gray-50"
              >
                Voir le panier
              </Link>
            </div>

            {/* Info */}
            <div className="mt-8 space-y-4 border-t pt-8">
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Livraison</h4>
                <p className="text-sm text-gray-600">Livraison gratuite dès 50€ d'achat</p>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-900">Retours</h4>
                <p className="text-sm text-gray-600">Retours gratuits sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}