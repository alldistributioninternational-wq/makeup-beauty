// src/types/look.types.ts
export interface LookProductItem {
  productId: string;
  category: string;
  shadeId?: string;
  note?: string;
}

export interface LookCreator {
  name: string;
  username: string;
  // Avatar complètement supprimé
}

export interface Look {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: LookCreator;
  likes: number;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'débutant' | 'intermédiaire' | 'expert';
  createdAt: string;
  products: LookProductItem[];
  
  // Propriétés optionnelles (si besoin)
  category?: string;
  saves?: number;
  shares?: number;
  video?: string;
  duration?: number;
}

import type { Product } from './product.types';

export interface LookWithProducts extends Look {
  productDetails: Product[];
}