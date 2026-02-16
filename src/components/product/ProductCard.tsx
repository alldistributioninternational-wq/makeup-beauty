// src/components/product/ProductCard.tsx
// Version Cloudinary - Les images sont chargées depuis Cloudinary, pas depuis /public/images

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { ShoppingCart, Check } from 'lucide-react';
import { getCloudinaryUrl, ImageVariants } from '@/lib/cloudinary';

// Type Product adapté pour Supabase + Cloudinary
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cloudinary_id: string | null; // ← Cloudinary ID au lieu de image URL
  description?: string;
  category?: string;
  shades?: Array<{
    id: string;
    name: string;
    hex: string;
  }>;
  in_stock?: boolean;
  is_featured?: boolean;
}

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
  // Parser les shades si c'est du JSON string
  const shades = (() => {
    if (!product.shades) return [];
    if (typeof product.shades === 'string') {
      try {
        return JSON.parse(product.shades);
      } catch {
        return [];
      }
    }
    return product.shades;
  })();

  const [selectedShadeId, setSelectedShadeId] = useState(
    defaultShadeId || shades?.[0]?.id || 'default'
  );
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Trouver la shade sélectionnée
    const selectedShade = shades?.find((s: any) => s.id === selectedShadeId);
    
    // Construire l'objet CartItem complet
    addItem({
      productId: product.id,
      shadeId: selectedShadeId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.cloudinary_id 
        ? getCloudinaryUrl(product.cloudinary_id) 
        : '/placeholder-product.jpg', // Fallback
      shade: selectedShade?.name || 'Unique',
      quantity: 1,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // ✅ GÉNÉRER L'URL CLOUDINARY optimisée
  const imageUrl = product.cloudinary_id 
    ? ImageVariants.card(product.cloudinary_id) // Taille card (400px)
    : '/placeholder-product.jpg';

  return (
    <div className="group">
      <Link href={`/shop/products/${product.id}`} className="block">
        {/* Image depuis Cloudinary */}
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badge featured */}
          {product.is_featured && (
            <div className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
              ⭐ Bestseller
            </div>
          )}

          {/* Out of stock */}
          {!product.in_stock && (
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
        {shades && shades.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {shades.slice(0, 6).map((shade: any) => (
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
            {shades.length > 6 && (
              <span className="flex h-6 items-center text-xs text-gray-500">
                +{shades.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Quick add button */}
        {showQuickAdd && product.in_stock && (
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