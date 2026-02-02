// src/components/product/ProductCard.tsx

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product.types';
import { useCartStore } from '@/store/cart.store';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  defaultShadeId?: string;
  showQuickAdd?: boolean;
}

export default function ProductCard({ 
  product, 
  defaultShadeId,
  showQuickAdd = true 
}: ProductCardProps) {
  const [selectedShadeId, setSelectedShadeId] = useState(defaultShadeId || product.shades?.[0]?.id || 'default');
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trouver la shade sélectionnée
    const selectedShade = product.shades?.find(s => s.id === selectedShadeId);
    
    // Construire l'objet CartItem complet
    addItem({
      productId: product.id,
      shadeId: selectedShadeId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      shade: selectedShade?.name || 'Unique',
      quantity: 1,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group">
      <Link href={`/shop/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badge featured */}
          {product.featured && (
            <div className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              ⭐ Bestseller
            </div>
          )}

          {/* Out of stock */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-lg bg-white px-4 py-2 font-semibold text-gray-900">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-2">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
          <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-lg font-bold text-gray-900">{product.price}€</p>
        </div>

        {/* Shades */}
        {product.shades && product.shades.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {product.shades.slice(0, 6).map((shade) => (
              <button
                key={shade.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedShadeId(shade.id);
                }}
                className={`h-6 w-6 rounded-full border-2 transition-all ${
                  selectedShadeId === shade.id
                    ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: shade.hex }}
                title={shade.name}
              />
            ))}
            {product.shades.length > 6 && (
              <span className="flex h-6 items-center text-xs text-gray-500">
                +{product.shades.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Quick add button */}
        {showQuickAdd && product.inStock && (
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`w-full rounded-lg py-2.5 font-semibold transition-all ${
              isAdded
                ? 'bg-green-500 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isAdded ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Ajouté !
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </span>
            )}
          </button>
        )}
      </Link>
    </div>
  );
}