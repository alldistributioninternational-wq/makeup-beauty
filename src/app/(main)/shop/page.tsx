// src/app/(main)/shop/page.tsx
// Version Supabase + Cloudinary - Les produits sont chargés depuis la base de données

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Type Product depuis Supabase
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cloudinary_id: string | null;
  category: string;
  description?: string;
  shades?: any; // JSON ou Array
  in_stock: boolean;
  is_featured: boolean;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Mapping des catégories (français → valeurs DB)
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

  // ✅ Charger les produits depuis Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('name');

        // Filtrer par catégorie si pas "Tous"
        if (selectedCategory !== 'Tous') {
          const dbCategory = categoryMap[selectedCategory];
          query = query.eq('category', dbCategory);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
            >
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
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            Tous nos produits
          </h1>
          <p className="text-lg text-gray-600">
            Découvre notre collection complète de maquillage
          </p>
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
            <p className="text-gray-500 text-lg mb-4">
              Aucun produit trouvé dans cette catégorie
            </p>
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