// src/lib/adapters.ts
// Adaptateurs pour convertir les données Supabase au format de vos types existants

import type { Product as SupabaseProduct, Look as SupabaseLook } from '@/types/supabase.types';
import type { Product as MockProduct } from '@/types/product.types';
import type { Look as MockLook } from '@/types/look.types';

/**
 * Convertit un produit Supabase au format mock
 */
export function adaptSupabaseProductToMock(supabaseProduct: SupabaseProduct): MockProduct {
  // Parser les shades si c'est du JSON string
  let shades = [];
  if (supabaseProduct.shades) {
    if (typeof supabaseProduct.shades === 'string') {
      try {
        shades = JSON.parse(supabaseProduct.shades);
      } catch {
        shades = [];
      }
    } else {
      shades = supabaseProduct.shades;
    }
  }

  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    brand: (supabaseProduct as any).brands?.name || 'Ilma Beauty',
    category: supabaseProduct.category as any,
    price: Number(supabaseProduct.price),
    image: supabaseProduct.image_url || '/placeholder-product.jpg',
    description: supabaseProduct.description || '',
    shades: shades,
    inStock: supabaseProduct.in_stock,
    featured: supabaseProduct.is_featured,
  };
}

/**
 * Convertit un look Supabase au format mock
 */
export function adaptSupabaseLookToMock(supabaseLook: SupabaseLook): MockLook {
  // Extraire les IDs des produits depuis look_products
  const productIds = (supabaseLook as any).look_products?.map((lp: any) => lp.product_id) || [];

  return {
    id: supabaseLook.id,
    title: supabaseLook.title,
    description: supabaseLook.description || '',
    image: supabaseLook.image_url || '/placeholder-look.jpg',
    creator: {
      name: supabaseLook.creator_name,
      username: supabaseLook.creator_username,
    },
    likes: supabaseLook.likes,
    products: productIds,
    tags: supabaseLook.tags || [],
    difficulty: supabaseLook.difficulty as any,
    createdAt: supabaseLook.created_at,
  };
}

/**
 * Convertit un tableau de produits Supabase
 */
export function adaptSupabaseProducts(products: SupabaseProduct[]): MockProduct[] {
  return products.map(adaptSupabaseProductToMock);
}

/**
 * Convertit un tableau de looks Supabase
 */
export function adaptSupabaseLooks(looks: SupabaseLook[]): MockLook[] {
  return looks.map(adaptSupabaseLookToMock);
}