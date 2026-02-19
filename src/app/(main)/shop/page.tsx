// src/app/(main)/shop/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';

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

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const categoryMap: Record<string, string> = {
    'Tous': 'all',
    'Teint': 'foundation',
    'Correcteur': 'concealer',
    'Yeux': 'eyeshadow',
    'Lèvres': 'lipstick',
    'Joues': 'blush',
    'Mascara': 'mascara',
    'Highlighter': 'highlighter',
    'Poudre': 'powder',
  };

  const categories = ['Tous', 'Teint', 'Correcteur', 'Yeux', 'Lèvres', 'Joues', 'Mascara', 'Highlighter', 'Poudre'];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*').order('name');
        if (selectedCategory !== 'Tous') {
          query = query.eq('category', categoryMap[selectedCategory]);
        }
        const { data, error } = await query;
        if (error) {
          console.error('Erreur Supabase:', error);
          setProducts([]);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  const ProductCard = ({ product }: { product: Product }) => {
    let shades: any[] = [];
    if (product.shades) {
      try {
        shades = typeof product.shades === 'string' ? JSON.parse(product.shades) : product.shades;
      } catch { shades = []; }
    }

    return (
      <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-shadow">
        {/* Image cliquable → page produit */}
        <Link href={`/shop/products/${product.id}`} className="block">
          <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
            {product.cloudinary_id ? (
              <img
                src={getCloudinaryUrl(product.cloudinary_id)}
                alt={product.name}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-5xl">💄</div>
            )}
            {product.is_featured && (
              <span className="absolute top-2 left-2 bg-black text-white text-xs font-semibold px-2 py-1 rounded-full">
                ⭐ Bestseller
              </span>
            )}
          </div>
        </Link>

        {/* Infos */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</p>

          {/* Nom cliquable → page produit */}
          <Link href={`/shop/products/${product.id}`} className="font-semibold text-gray-900 leading-tight hover:underline">
            {product.name}
          </Link>

          <p className="font-bold text-gray-900">{Number(product.price).toFixed(0)}€</p>

          {/* Shades */}
          {shades.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {shades.slice(0, 4).map((shade: any) => (
                <div
                  key={shade.id}
                  className="h-5 w-5 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: shade.hex || shade.color || '#ccc' }}
                  title={shade.name}
                />
              ))}
              {shades.length > 4 && (
                <span className="text-xs text-gray-400 self-center">+{shades.length - 4}</span>
              )}
            </div>
          )}

          {/* Bouton pink → page produit */}
          <Link
            href={`/shop/products/${product.id}`}
            className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
              product.in_stock
                ? 'bg-pink-500 hover:bg-pink-600'
                : 'bg-gray-300 pointer-events-none'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.in_stock ? 'Ajouter au panier' : 'Rupture de stock'}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
            <Link href="/cart" className="text-sm font-medium hover:text-gray-600">
              Panier
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">Tous nos produits</h1>
          <p className="text-lg text-gray-600">Découvre notre collection complète de maquillage</p>
          <p className="mt-2 text-xs text-green-600">
            ✅ Images chargées depuis Cloudinary • Données depuis Supabase
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                category === selectedCategory
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products count */}
        <p className="mb-6 text-sm text-gray-500">
          {loading ? 'Chargement...' : `${products.length} produit${products.length > 1 ? 's' : ''}`}
        </p>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Aucun produit trouvé dans cette catégorie</p>
            <button
              onClick={() => setSelectedCategory('Tous')}
              className="text-gray-900 font-semibold hover:underline"
            >
              Voir tous les produits
            </button>
          </div>
        )}
      </main>
    </div>
  );
}