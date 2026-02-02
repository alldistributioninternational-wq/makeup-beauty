// src/types/product.types.ts

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'foundation' | 'concealer' | 'powder' | 'blush' | 'bronzer' | 'highlighter' | 'eyeshadow' | 'mascara' | 'eyeliner' | 'lipstick' | 'lipliner' | 'gloss';
  price: number;
  image: string;
  description: string;
  shades?: Shade[];
  inStock: boolean;
  featured?: boolean;
}

export interface Shade {
  id: string;
  name: string;
  hex: string;
  image?: string;
}

// src/types/look.types.ts

export interface Look {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: {
    name: string;
    avatar: string;
    username: string;
  };
  likes: number;
  products: LookProduct[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'débutant' | 'intermédiaire' | 'expert';
  createdAt: string;
}

export interface LookProduct {
  productId: string;
  category: string;
  shadeId?: string;
  note?: string;
}

// src/types/cart.types.ts

export interface CartItem {
  productId: string;
  shadeId?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}