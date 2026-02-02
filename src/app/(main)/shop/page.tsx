// src/app/(main)/shop/page.tsx

import Link from 'next/link';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/product/ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function ShopPage() {
  const categories = [
    'Tous',
    'Teint',
    'Yeux',
    'Lèvres',
    'Joues',
  ];

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
            <a href="/cart" className="text-sm font-medium hover:text-gray-600">
              Panier
            </a>
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
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                category === 'Tous'
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
          {mockProducts.length} produits
        </p>

        {/* Products grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}